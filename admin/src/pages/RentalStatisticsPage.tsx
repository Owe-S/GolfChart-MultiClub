import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import SkeletonTable from '../components/SkeletonTable';
import EmptyStateCard from '../components/EmptyStateCard';
import '../ski-gk-theme.css';

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalRentals: number;
  totalHoles: number;
  totalCost: number;
  cancellations: number;
  lastRentalDate: Date | null;
}

interface CartStats {
  cartId: number;
  cartName: string;
  totalRentals: number;
  utilization: number; // percentage
  revenue: number;
}

function RentalStatisticsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [cartStats, setCartStats] = useState<CartStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'players' | 'carts' | 'overview'>('overview');

  useEffect(() => {
    loadStatistics();
  }, []);

  async function loadStatistics() {
    setLoading(true);
    try {
      const rentalsRef = collection(db, 'rentals');
      const rentalsQuery = query(rentalsRef);
      const snapshot = await getDocs(rentalsQuery);
      
      const rentals: Rental[] = [];
      snapshot.forEach((doc) => {
        rentals.push({ id: doc.id, ...doc.data() } as Rental);
      });

      // Player statistics
      const playerMap = new Map<string, PlayerStats>();
      const cartMap = new Map<number, CartStats>();

      rentals.forEach((rental) => {
        const playerId = rental.playerId || 'unknown';
        
        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, {
            playerId,
            playerName: rental.renterName,
            totalRentals: 0,
            totalHoles: 0,
            totalCost: 0,
            cancellations: 0,
            lastRentalDate: null,
          });
        }

        const playerStat = playerMap.get(playerId)!;
        if (rental.status !== 'cancelled') {
          playerStat.totalRentals += 1;
          playerStat.totalHoles += rental.holes;
          playerStat.totalCost += rental.price || 0;
          const rentalDate = rental.startTime.toDate();
          if (!playerStat.lastRentalDate || rentalDate > playerStat.lastRentalDate) {
            playerStat.lastRentalDate = rentalDate;
          }
        } else {
          playerStat.cancellations += 1;
        }

        // Cart statistics
        if (!cartMap.has(rental.cartId)) {
          cartMap.set(rental.cartId, {
            cartId: rental.cartId,
            cartName: `Bil #${rental.cartId}`,
            totalRentals: 0,
            utilization: 0,
            revenue: 0,
          });
        }

        const cartStat = cartMap.get(rental.cartId)!;
        if (rental.status !== 'cancelled') {
          cartStat.totalRentals += 1;
          cartStat.revenue += rental.price || 0;
        }
      });

      // Sort and calculate utilization
      const playerArray = Array.from(playerMap.values())
        .sort((a, b) => b.totalRentals - a.totalRentals);
      
      const cartArray = Array.from(cartMap.values())
        .map(cart => ({
          ...cart,
          utilization: (cart.totalRentals / Math.max(rentals.length / 5, 1)) * 100,
        }))
        .sort((a, b) => b.totalRentals - a.totalRentals);

      setPlayerStats(playerArray);
      setCartStats(cartArray);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalRentals = playerStats.reduce((sum, p) => sum + p.totalRentals, 0);
  const totalCancellations = playerStats.reduce((sum, p) => sum + p.cancellations, 0);
  const totalRevenue = playerStats.reduce((sum, p) => sum + p.totalCost, 0);
  const cancellationRate = totalRentals > 0 ? ((totalCancellations / (totalRentals + totalCancellations)) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Leistatistikk</h1>
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Leistatistikk & Spillerdata</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Oversikt
          </button>
          <button 
            className={`filter-btn ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Spillere ({playerStats.length})
          </button>
          <button 
            className={`filter-btn ${activeTab === 'carts' ? 'active' : ''}`}
            onClick={() => setActiveTab('carts')}
          >
            Biler ({cartStats.length})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total leiinger</div>
              <div className="metric-value">{totalRentals}</div>
              <div className="metric-detail">Confirmed rentals</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avsluttet</div>
              <div className="metric-value">{totalCancellations}</div>
              <div className="metric-detail">{cancellationRate}% cancellation rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total inntekt</div>
              <div className="metric-value">{totalRevenue.toLocaleString()} kr</div>
              <div className="metric-detail">Revenue from rentals</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Gjennomsnitt per spiller</div>
              <div className="metric-value">
                {playerStats.length > 0 ? (totalRentals / playerStats.length).toFixed(1) : '0'}
              </div>
              <div className="metric-detail">Rentals per player</div>
            </div>
          </div>

          <div className="player-stats-header">
            <h3>Top 5 aktive spillere</h3>
            <table className="bookings-table player-stats-table">
              <thead>
                <tr>
                  <th>Spiller-ID</th>
                  <th>Navn</th>
                  <th>Leiinger</th>
                  <th>Total hull</th>
                  <th>Inntekt</th>
                  <th>Avsluttet</th>
                  <th>Siste leie</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.slice(0, 5).map((player) => (
                  <tr key={player.playerId}>
                    <td>
                      <strong>{player.playerId}</strong>
                    </td>
                    <td>{player.playerName}</td>
                    <td>
                      <span className="status-badge active">{player.totalRentals}</span>
                    </td>
                    <td>{player.totalHoles}</td>
                    <td><strong>{player.totalCost} kr</strong></td>
                    <td>
                      {player.cancellations > 0 && (
                        <span className="status-badge cancelled cart-utilization-small">
                          {player.cancellations}
                        </span>
                      )}
                    </td>
                    <td>
                      {player.lastRentalDate ? (
                        player.lastRentalDate.toLocaleDateString('nb-NO')
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div>
          {playerStats.length > 0 ? (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Spiller-ID</th>
                  <th>Navn</th>
                  <th>Leiinger</th>
                  <th>Hull (total)</th>
                  <th>Inntekt</th>
                  <th>Avsluttet</th>
                  <th>Siste aktivitet</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((player) => (
                  <tr key={player.playerId}>
                    <td>
                      <strong>{player.playerId}</strong>
                    </td>
                    <td>{player.playerName}</td>
                    <td>
                      <span className="status-badge active">{player.totalRentals}</span>
                    </td>
                    <td>
                      {player.totalHoles} 
                      <span className="stat-average">
                        ({(player.totalHoles / player.totalRentals).toFixed(1)} gjennomsnitt)
                      </span>
                    </td>
                    <td>
                      <strong>{player.totalCost} kr</strong>
                    </td>
                    <td>
                      {player.cancellations > 0 ? (
                        <span className="status-badge cancelled">
                          {player.cancellations}
                        </span>
                      ) : (
                        <span className="stat-dash">-</span>
                      )}
                    </td>
                    <td>
                      {player.lastRentalDate ? (
                        player.lastRentalDate.toLocaleDateString('nb-NO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyStateCard 
              icon="👥"
              title="Ingen spillerdata"
              message="Ingen leiinger registrert ennå."
            />
          )}
        </div>
      )}

      {/* Carts Tab */}
      {activeTab === 'carts' && (
        <div>
          {cartStats.length > 0 ? (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Bil</th>
                  <th>Leiinger</th>
                  <th>Utnyttelse</th>
                  <th>Inntekt</th>
                </tr>
              </thead>
              <tbody>
                {cartStats.map((cart) => (
                  <tr key={cart.cartId}>
                    <td>
                      <span className="cart-badge">🚗 {cart.cartName}</span>
                    </td>
                    <td>
                      <strong>{cart.totalRentals}</strong>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-track">
                          <div className="progress-bar"
                            data-width={`${Math.min(cart.utilization, 100)}%`}
                          />
                        </div>
                        <span>{cart.utilization.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <strong>{cart.revenue} kr</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyStateCard 
              icon="🚗"
              title="Ingen bildata"
              message="Ingen leiinger registrert for bilene."
            />
          )}
        </div>
      )}
    </div>
  );
}

export default RentalStatisticsPage;
