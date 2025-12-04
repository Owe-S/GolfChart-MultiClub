import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import '../ski-gk-theme.css';

function BookingsListPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const rentalsRef = collection(db, 'rentals');
    const rentalsQuery = query(rentalsRef, orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(rentalsQuery, (snapshot) => {
      const rentalsData: Rental[] = [];
      snapshot.forEach((doc) => {
        rentalsData.push({ id: doc.id, ...doc.data() } as Rental);
      });
      setRentals(rentalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRentals = rentals.filter(rental => {
    const now = new Date();
    const startTime = rental.startTime.toDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'today':
        return startTime >= today && startTime < tomorrow;
      case 'upcoming':
        return startTime > now;
      case 'past':
        return startTime < now;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Laster bookinger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Alle Bookinger</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button 
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            I Dag
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Kommende
          </button>
          <button 
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Tidligere
          </button>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Dato & Tid</th>
              <th>Bil</th>
              <th>Kunde</th>
              <th>Kontakt</th>
              <th>Hull</th>
              <th>Pris</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map((rental) => {
              const startTime = rental.startTime.toDate();
              const now = new Date();
              const isActive = startTime <= now && 
                new Date(startTime.getTime() + (rental.holes === 18 ? 4 : 2) * 60 * 60 * 1000) >= now;
              const isPast = new Date(startTime.getTime() + (rental.holes === 18 ? 4 : 2) * 60 * 60 * 1000) < now;

              return (
                <tr key={rental.id} className={isActive ? 'active-row' : ''}>
                  <td>
                    {startTime.toLocaleDateString('nb-NO', { 
                      day: '2-digit', 
                      month: 'short',
                      year: 'numeric'
                    })}
                    <br />
                    <span className="time-text">
                      {startTime.toLocaleTimeString('nb-NO', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="cart-badge">🚗 Bil #{rental.cartId}</span>
                  </td>
                  <td>
                    <strong>{rental.renterName}</strong>
                    {rental.isMember && <span className="member-badge">Medlem</span>}
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>📞 {rental.phone}</div>
                      {rental.email && <div>✉️ {rental.email}</div>}
                    </div>
                  </td>
                  <td>{rental.holes} hull</td>
                  <td><strong>{rental.price} kr</strong></td>
                  <td>
                    {isActive ? (
                      <span className="status-badge active">● Aktiv</span>
                    ) : isPast ? (
                      <span className="status-badge completed">✓ Fullført</span>
                    ) : (
                      <span className="status-badge upcoming">⏰ Kommende</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRentals.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-state-icon">📋</div>
            <p>Ingen bookinger funnet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsListPage;
