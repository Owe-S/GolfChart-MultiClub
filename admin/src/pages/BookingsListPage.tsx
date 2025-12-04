import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import SkeletonTable from '../components/SkeletonTable';
import EmptyStateCard from '../components/EmptyStateCard';
import '../ski-gk-theme.css';

function BookingsListPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

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

  const handleCancelRental = async () => {
    if (!selectedRentalId || !cancellationReason.trim()) {
      alert('Vennligst fyll inn avslutningsgrunn');
      return;
    }

    try {
      const rentalRef = doc(db, 'rentals', selectedRentalId);
      await updateDoc(rentalRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancellationReason: cancellationReason.trim(),
      });
      setCancelModalOpen(false);
      setSelectedRentalId(null);
      setCancellationReason('');
      alert('✓ Booking avsluttet');
    } catch (error) {
      console.error('Error cancelling rental:', error);
      alert('✗ Feil ved avslutting av booking');
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const now = new Date();
    const startTime = rental.startTime.toDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Skip cancelled rentals unless explicitly looking at all
    if (rental.status === 'cancelled' && filter !== 'all') {
      return false;
    }

    switch (filter) {
      case 'today':
        return startTime >= today && startTime < tomorrow;
      case 'upcoming':
        return startTime > now && rental.status !== 'cancelled';
      case 'past':
        return startTime < now;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Alle Bookinger</h1>
        </div>
        <SkeletonTable rows={8} />
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
        {filteredRentals.length > 0 ? (
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
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
            {filteredRentals.map((rental) => {
              const startTime = rental.startTime.toDate();
              const now = new Date();
              const isActive = startTime <= now && 
                new Date(startTime.getTime() + (rental.holes === 18 ? 4 : 2) * 60 * 60 * 1000) >= now;
              const isPast = new Date(startTime.getTime() + (rental.holes === 18 ? 4 : 2) * 60 * 60 * 1000) < now;
              const isCancelled = rental.status === 'cancelled';

              return (
                <tr key={rental.id} className={isActive ? 'active-row' : ''} style={{ opacity: isCancelled ? 0.6 : 1 }}>
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
                    {isCancelled ? (
                      <span className="status-badge cancelled">✗ Avsluttet</span>
                    ) : isActive ? (
                      <span className="status-badge active">● Aktiv</span>
                    ) : isPast ? (
                      <span className="status-badge completed">✓ Fullført</span>
                    ) : (
                      <span className="status-badge upcoming">⏰ Kommende</span>
                    )}
                  </td>
                  <td>
                    {!isCancelled && startTime > now && (
                      <button
                        className="btn-cancel-rental"
                        onClick={() => {
                          setSelectedRentalId(rental.id);
                          setCancelModalOpen(true);
                        }}
                      >
                        Avslut
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        ) : (
          <EmptyStateCard 
            icon="📋"
            title="Ingen bookinger funnet"
            message="Ingen bookinger for valgt filter. Dette er ikke en feil."
          />
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Avslut booking</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Vennligst fyll inn årsaken til avslutning:
            </p>
            <textarea
              placeholder="Årsak til avslutning (f.eks. spiller er syk, værforhold, etc.)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancellationReason('');
                }}
              >
                Avbryt
              </button>
              <button
                className="btn-primary"
                onClick={handleCancelRental}
                style={{ backgroundColor: '#d32f2f' }}
              >
                Avslut booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsListPage;
