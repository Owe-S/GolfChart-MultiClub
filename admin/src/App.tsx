import { useState } from 'react';
import './ski-gk-theme.css';
import BookingStepper, { INITIAL_DATA } from './components/BookingStepper';
import type { BookingData } from './components/BookingStepper';
import Calendar from './components/Calendar';
import AvailabilityGrid from './components/AvailabilityGrid';
import { initializeDatabase } from './initDatabase';

import type { GolfCart } from './types';

function App() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_DATA);

  const handleInitDatabase = async () => {
    if (!confirm('Dette vil opprette 5 golfbiler i Firestore (Blå 4, Blå 5, Grønn, Hvit, Svart). Fortsette?')) {
      return;
    }

    setIsInitializing(true);
    try {
      await initializeDatabase();
      alert('Database initialisert med 5 biler!');
    } catch (error) {
      console.error('Database initialization error:', error);
      alert('Feil under initialisering.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDateChange = (date: string) => {
    setBookingData(prev => ({ ...prev, date, time: '' }));
  };

  const handleSlotSelect = (cart: GolfCart, time: string) => {
    setBookingData(prev => ({
      ...prev,
      time,
      cartId: cart.id,
      cartName: cart.name,
      holes: 18 // Default to 18, user can change in details
    }));
    setCurrentStep(1); // Go to Details step
  };

  return (
    <>
      {/* Sticky Header */}
      <header className="app-header">
        <div className="app-logo">
          <span>SKI GOLFKLUBB</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {import.meta.env.DEV && (
            <button
              onClick={handleInitDatabase}
              disabled={isInitializing}
              style={{
                padding: '5px 10px',
                background: '#fff3cd',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🛠️ Reset DB
            </button>
          )}
          <div style={{ fontSize: '24px' }}>☰</div>
        </div>
      </header>

      <div className="app-container">
        {/* Left Panel - Visualization (Desktop Only) */}
        <div className="left-panel">
          <div className="card">
            <h2 className="card-title">Kalender</h2>
            <Calendar
              selectedDate={bookingData.date}
              onDateChange={handleDateChange}
            />
          </div>

          <div className="card">
            <h2 className="card-title">Tilgjengelighet</h2>
            <p style={{ marginBottom: '10px' }}>Oversikt for {bookingData.date}</p>
            <AvailabilityGrid
              selectedDate={bookingData.date}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </div>

        {/* Right Panel - Booking Wizard */}
        <div className="right-panel">
          {bookingData.time ? (
            <BookingStepper
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>👈</div>
              <h3>Velg en ledig tid i kalenderen</h3>
              <p style={{ color: '#666' }}>Klikk på en grønn rute til venstre for å starte bookingen.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
