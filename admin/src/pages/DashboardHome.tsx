import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import SkeletonCard from '../components/SkeletonCard';
import EmptyStateCard from '../components/EmptyStateCard';
import '../ski-gk-theme.css';

interface DashboardStats {
  activeRentals: number;
  completedToday: number;
  revenueToday: number;
  nextBookingTime: string | null;
}

interface ActiveRental extends Rental {
  cartName?: string;
  timeRemaining?: string;
}

function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    activeRentals: 0,
    completedToday: 0,
    revenueToday: 0,
    nextBookingTime: null,
  });
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query all rentals
    const rentalsRef = collection(db, 'rentals');
    const unsubscribe = onSnapshot(rentalsRef, (snapshot) => {
      const rentals: Rental[] = [];
      snapshot.forEach((doc) => {
        rentals.push({ id: doc.id, ...doc.data() } as Rental);
      });

      const now = new Date();

      // Calculate stats
      const active = rentals.filter(r => {
        const start = r.startTime.toDate();
        const durationHours = r.holes === 18 ? 4 : 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
        return start <= now && end >= now;
      });

      const completed = rentals.filter(r => {
        const start = r.startTime.toDate();
        const durationHours = r.holes === 18 ? 4 : 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
        return end < now;
      });

      const revenueToday = rentals.reduce((sum, r) => sum + (r.price || 0), 0);

      // Find next upcoming booking
      const upcoming = rentals.filter(r => r.startTime.toDate() > now)
        .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
      
      const nextBooking = upcoming.length > 0 
        ? upcoming[0].startTime.toDate().toLocaleTimeString('nb-NO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : null;

      // Add time remaining to active rentals
      const activeWithTime = active.map(rental => {
        const start = rental.startTime.toDate();
        const durationHours = rental.holes === 18 ? 4 : 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
        const remaining = Math.ceil((end.getTime() - now.getTime()) / (60 * 1000)); // minutes
        
        return {
          ...rental,
          timeRemaining: remaining > 60 
            ? `${Math.floor(remaining / 60)}t ${remaining % 60}m`
            : `${remaining}m`
        };
      });

      setStats({
        activeRentals: active.length,
        completedToday: completed.length,
        revenueToday,
        nextBookingTime: nextBooking,
      });

      setActiveRentals(activeWithTime);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          {new Date().toLocaleDateString('nb-NO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards - Always visible with skeleton loading */}
      <div className="stats-grid">
        <div className="stat-card active-rentals">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <span className="skeleton-loader" style={{ width: '40px', height: '28px', display: 'inline-block' }} />
              ) : (
                stats.activeRentals
              )}
            </div>
            <div className="stat-label">Aktive Utleier</div>
          </div>
        </div>

        <div className="stat-card completed-today">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <span className="skeleton-loader" style={{ width: '40px', height: '28px', display: 'inline-block' }} />
              ) : (
                stats.completedToday
              )}
            </div>
            <div className="stat-label">Fullført I Dag</div>
          </div>
        </div>

        <div className="stat-card revenue-today">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <span className="skeleton-loader" style={{ width: '60px', height: '28px', display: 'inline-block' }} />
              ) : (
                `${stats.revenueToday} kr`
              )}
            </div>
            <div className="stat-label">Inntekt I Dag</div>
          </div>
        </div>

        <div className="stat-card next-booking">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <span className="skeleton-loader" style={{ width: '50px', height: '28px', display: 'inline-block' }} />
              ) : (
                stats.nextBookingTime || 'Ingen'
              )}
            </div>
            <div className="stat-label">Neste Booking</div>
          </div>
        </div>
      </div>

      {/* Active Rentals Section - Always visible */}
      <div className="dashboard-section">
        <h2 className="section-title">Aktive Utleier</h2>
        {loading ? (
          <div className="active-rentals-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activeRentals.length > 0 ? (
          <div className="active-rentals-grid">
            {activeRentals.map((rental) => (
              <div key={rental.id} className="rental-card">
                <div className="rental-header">
                  <span className="rental-cart">
                    🚗 Bil #{rental.cartId}
                  </span>
                  <span className="rental-time-badge">
                    {rental.timeRemaining} gjenstår
                  </span>
                </div>
                <div className="rental-body">
                  <div className="rental-customer">
                    <strong>{rental.renterName}</strong>
                  </div>
                  <div className="rental-details">
                    <span>📞 {rental.phone}</span>
                    <span>⛳ {rental.holes} hull</span>
                  </div>
                  <div className="rental-time">
                    Startet: {rental.startTime.toDate().toLocaleTimeString('nb-NO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="rental-status-badge active">
                  ● Aktiv
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyStateCard 
            icon="🚗"
            title="Ingen aktive utleier"
            message="Ingen utleier er aktive akkurat nå. Dette er ikke en feil."
          />
        )}
      </div>

      {/* Quick Actions - Always visible */}
      <div className="dashboard-section">
        <h2 className="section-title">Hurtighandlinger</h2>
        <div className="quick-actions-grid">
          <Link to="/booking" className="quick-action-card">
            <div className="action-icon">➕</div>
            <div className="action-label">Ny Booking</div>
          </Link>
          <Link to="/bookings" className="quick-action-card">
            <div className="action-icon">📋</div>
            <div className="action-label">Se Alle Bookinger</div>
          </Link>
          <Link to="/carts" className="quick-action-card">
            <div className="action-icon">🚗</div>
            <div className="action-label">Administrer Biler</div>
          </Link>
          <Link to="/reports" className="quick-action-card">
            <div className="action-icon">📈</div>
            <div className="action-label">Vis Rapporter</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
