import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental, GolfCart } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../ski-gk-theme.css';

interface CartPerformanceData {
  cartId: number;
  cartName: string;
  totalBookings: number;
  totalHours: number;
  totalRevenue: number;
  utilizationPercentage: number;
}

function CartPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<CartPerformanceData[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadPerformanceData();
  }, [dateRange]);

  async function loadPerformanceData() {
    setLoading(true);
    try {
      // Get all carts
      const cartsRef = collection(db, 'carts');
      const cartsSnapshot = await getDocs(cartsRef);
      const carts: GolfCart[] = [];
      cartsSnapshot.forEach((doc) => {
        carts.push({ ...doc.data() } as GolfCart);
      });

      // Get all rentals
      const rentalsRef = collection(db, 'rentals');
      const rentalsSnapshot = await getDocs(rentalsRef);
      const rentals: Rental[] = [];
      rentalsSnapshot.forEach((doc) => {
        rentals.push({ id: doc.id, ...doc.data() } as Rental);
      });

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      let totalDays = 0;

      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          totalDays = 7;
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          totalDays = 30;
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          totalDays = 365;
          break;
      }

      // Filter rentals by date range
      const filteredRentals = rentals.filter(rental => {
        const rentalDate = rental.startTime.toDate();
        return rentalDate >= startDate && rentalDate <= now;
      });

      // Calculate performance for each cart
      const performance: CartPerformanceData[] = carts.map(cart => {
        const cartRentals = filteredRentals.filter(r => r.cartId === cart.id);
        
        const totalBookings = cartRentals.length;
        const totalHours = cartRentals.reduce((sum, rental) => {
          return sum + (rental.holes === 18 ? 4 : 2);
        }, 0);
        const totalRevenue = cartRentals.reduce((sum, rental) => sum + rental.price, 0);
        
        // Calculate utilization (assuming 10 hours available per day)
        const availableHours = totalDays * 10;
        const utilizationPercentage = availableHours > 0 ? (totalHours / availableHours) * 100 : 0;

        return {
          cartId: cart.id,
          cartName: cart.name,
          totalBookings,
          totalHours,
          totalRevenue,
          utilizationPercentage,
        };
      });

      setPerformanceData(performance.sort((a, b) => b.totalRevenue - a.totalRevenue));

    } catch (error) {
      console.error('Error loading cart performance:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = performanceData.reduce((sum, cart) => sum + cart.totalRevenue, 0);
  const totalBookings = performanceData.reduce((sum, cart) => sum + cart.totalBookings, 0);
  const avgUtilization = performanceData.length > 0
    ? performanceData.reduce((sum, cart) => sum + cart.utilizationPercentage, 0) / performanceData.length
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚗 Bilutnyttelse</h1>
      </div>

      {/* Date Range Controls */}
      <div className="report-controls">
        <div className="date-range-buttons">
          <button
            className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            Siste 7 dager
          </button>
          <button
            className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            Siste måned
          </button>
          <button
            className={`range-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDateRange('year')}
          >
            Siste år
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Laster data...</p>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">{totalRevenue.toLocaleString('nb-NO')} kr</div>
              <div className="metric-label">Total Inntekt</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-value">{totalBookings}</div>
              <div className="metric-label">Totale Bookinger</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-value">{avgUtilization.toFixed(1)}%</div>
              <div className="metric-label">Gjennomsnittlig Utnyttelse</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🚗</div>
              <div className="metric-value">{performanceData.length}</div>
              <div className="metric-label">Antall Biler</div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="performance-table-container">
            <h3 className="section-title">Ytelse per bil</h3>
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Bil</th>
                  <th>Bookinger</th>
                  <th>Timer Brukt</th>
                  <th>Inntekt</th>
                  <th>Utnyttelse</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((cart) => (
                  <tr key={cart.cartId}>
                    <td>
                      <strong>{cart.cartName}</strong>
                      <br />
                      <span className="cart-id-text">ID: {cart.cartId}</span>
                    </td>
                    <td>{cart.totalBookings}</td>
                    <td>{cart.totalHours}h</td>
                    <td><strong>{cart.totalRevenue.toLocaleString('nb-NO')} kr</strong></td>
                    <td>
                      <div className="utilization-cell">
                        <div className="utilization-bar-bg">
                          <div 
                            className="utilization-bar-fill"
                            style={{ 
                              width: `${Math.min(cart.utilizationPercentage, 100)}%`,
                              background: cart.utilizationPercentage > 70 ? '#00A86B' : 
                                        cart.utilizationPercentage > 40 ? '#FFD700' : '#C5221F'
                            }}
                          />
                        </div>
                        <span className="utilization-text">{cart.utilizationPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`performance-badge ${
                        cart.utilizationPercentage > 70 ? 'excellent' :
                        cart.utilizationPercentage > 40 ? 'good' : 'low'
                      }`}>
                        {cart.utilizationPercentage > 70 ? '⭐ Utmerket' :
                         cart.utilizationPercentage > 40 ? '✓ God' : '⚠️ Lav'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {performanceData.length === 0 && (
              <div className="empty-state-card">
                <div className="empty-state-icon">🚗</div>
                <p>Ingen data tilgjengelig for valgt periode</p>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Revenue by Cart */}
            <div className="chart-card">
              <h3 className="chart-title">Inntekt per bil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cartName" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('nb-NO')} kr`} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#0066CC" name="Inntekt" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bookings by Cart */}
            <div className="chart-card">
              <h3 className="chart-title">Bookinger per bil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cartName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalBookings" fill="#00A86B" name="Bookinger" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Utilization by Cart */}
            <div className="chart-card full-width">
              <h3 className="chart-title">Utnyttelsesgrad per bil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cartName" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="utilizationPercentage" fill="#FFD700" name="Utnyttelse %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-card">
            <h3>💡 Anbefalinger</h3>
            <ul>
              {avgUtilization < 50 && (
                <li>
                  <strong>Lav gjennomsnittlig utnyttelse:</strong> Med {avgUtilization.toFixed(1)}% utnyttelse 
                  kan dere vurdere markedsføring eller prisreduksjoner for å øke bookinger.
                </li>
              )}
              {performanceData.some(cart => cart.utilizationPercentage < 30) && (
                <li>
                  <strong>Underbrukte biler:</strong> Noen biler har svært lav utnyttelse. 
                  Vurder vedlikehold, markedsføring av spesifikke biler, eller rotasjonssystem.
                </li>
              )}
              {performanceData.some(cart => cart.utilizationPercentage > 80) && (
                <li>
                  <strong>Høy etterspørsel:</strong> Noen biler har meget høy utnyttelse. 
                  Sørg for jevnlig vedlikehold og vurder å investere i flere biler.
                </li>
              )}
              {performanceData.length > 0 && (
                <li>
                  <strong>Beste bil:</strong> {performanceData[0].cartName} genererer mest inntekt 
                  med {performanceData[0].totalRevenue.toLocaleString('nb-NO')} kr. 
                  Analyser hva som gjør denne bilen populær.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPerformancePage;
