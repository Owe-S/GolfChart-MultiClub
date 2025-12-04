import { useState } from 'react';
import BookingStepper from '../components/BookingStepper';
import Calendar from '../components/Calendar';
import AvailabilityGrid from '../components/AvailabilityGrid';
import type { BookingData, GolfCart } from '../types';
import { INITIAL_DATA } from '../types';
import '../ski-gk-theme.css';

function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_DATA);

  const handleDateChange = (date: string) => {
    setBookingData(prev => ({ ...prev, date, time: '' }));
  };

  const handleSlotSelect = (cart: GolfCart, time: string) => {
    setBookingData(prev => ({
      ...prev,
      time,
      cartId: cart.id,
      cartName: cart.name,
      holes: 18 // Default to 18, user can change in step 1
    }));
    setCurrentStep(1); // Start at step 1 (Date/Time/Duration)
  };

  return (
    <div className="booking-page">
      <div className="booking-page-content">
        {/* Left Panel - Visualization */}
        <div className="booking-left-panel">
          <div className="card">
            <h2 className="card-title">Kalender</h2>
            <Calendar
              selectedDate={bookingData.date}
              onDateChange={handleDateChange}
            />
          </div>

          <div className="card">
            <h2 className="card-title">Tilgjengelighet</h2>
            <p className="availability-header">Oversikt for {bookingData.date}</p>
            <AvailabilityGrid
              selectedDate={bookingData.date}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </div>

        {/* Right Panel - Booking Wizard */}
        <div className="booking-right-panel">
          {bookingData.time ? (
            <BookingStepper
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon">👈</div>
              <h3>Velg en ledig tid i kalenderen</h3>
              <p className="empty-state-text">Klikk på en grønn rute til venstre for å starte bookingen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
