import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { GolfCart } from './types';
import Calendar from './components/Calendar';
import AvailabilityGrid from './components/AvailabilityGrid';
import BookingForm from './components/BookingForm';
import './user-theme.css';

function UserApp() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [carts, setCarts] = useState<GolfCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<GolfCart | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'form'>('select');

  // Load carts on mount
  useEffect(() => {
    const loadCarts = async () => {
      try {
        const cartsRef = collection(db, 'carts');
        const snapshot = await getDocs(cartsRef);
        const cartsData: GolfCart[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cartsData.push({ 
            id: data.id || parseInt(doc.id), 
            name: data.name, 
            status: data.status 
          });
        });
        setCarts(cartsData.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error('Error loading carts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCarts();
  }, []);

  const handleCartSelect = (cart: GolfCart) => {
    setSelectedCart(cart);
    setBookingStep('form');
  };

  const handleBooking = async (bookingData: any) => {
    if (!selectedCart) {
      alert('No cart selected');
      return;
    }

    try {
      const rentalsRef = collection(db, 'rentals');
      await addDoc(rentalsRef, {
        ...bookingData,
        cartId: selectedCart.id,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      alert('✓ Booking registered! Admin will confirm soon.');
      setBookingStep('select');
      setSelectedCart(null);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Booking error:', error);
      alert('✗ Error creating booking. Please try again.');
    }
  };

  return (
    <div className="user-app">
      <div className="app-header">
        <h1>⛳ SKI GOLFKLUBB</h1>
        <p>Leie av golfbil - Rask og enkel booking</p>
      </div>

      <div className="booking-steps">
        {bookingStep === 'select' ? (
          <div className="step active">
            <div className="step-header">
              <div className="step-number">1</div>
              <h2>Velg dato og golfbil</h2>
            </div>

            <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <div className="grid-title">Tilgjengelige tider</div>
            {loading ? (
              <div className="loading-container">
                <p>Laster tilgjengelighet...</p>
              </div>
            ) : (
              <AvailabilityGrid 
                selectedDate={selectedDate} 
                carts={carts} 
                onCartSelect={handleCartSelect}
              />
            )}
          </div>
        ) : (
          <div className="step active">
            <div className="step-header">
              <div className="step-number">2</div>
              <h2>Fyll ut leiedetaljer</h2>
            </div>

            <BookingForm 
              cart={selectedCart} 
              selectedDate={selectedDate}
              onSubmit={handleBooking}
              onCancel={() => {
                setBookingStep('select');
                setSelectedCart(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserApp;
