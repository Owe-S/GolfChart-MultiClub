import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { GolfCart } from '../types';

interface AvailabilityGridProps {
  selectedDate: string;
  carts: GolfCart[];
  onCartSelect: (cart: GolfCart) => void;
}

interface TimeSlot {
  label: string;
  time: string;
}

interface CellStatus {
  status: 'available' | 'booked';
}

const TIME_SLOTS: TimeSlot[] = [
  { label: '10:00', time: '10:00' },
  { label: '11:00', time: '11:00' },
  { label: '12:00', time: '12:00' },
  { label: '13:00', time: '13:00' },
  { label: '14:00', time: '14:00' },
  { label: '15:00', time: '15:00' },
  { label: '16:00', time: '16:00' },
  { label: '17:00', time: '17:00' },
  { label: '18:00', time: '18:00' },
  { label: '19:00', time: '19:00' },
  { label: '20:00', time: '20:00' },
];

function AvailabilityGrid({ selectedDate, carts, onCartSelect }: AvailabilityGridProps) {
  const [cellStatuses, setCellStatuses] = useState<Map<string, CellStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        const rentalsRef = collection(db, 'rentals');
        const snapshot = await getDocs(rentalsRef);
        
        const statusMap = new Map<string, CellStatus>();

        carts.forEach(cart => {
          TIME_SLOTS.forEach(slot => {
            const key = `${cart.id}-${slot.time}`;
            const slotTime = new Date(`${selectedDate}T${slot.time}:00`);

            // Check if any rental conflicts with this time slot
            const hasConflict = Array.from(snapshot.docs).some(doc => {
              const data = doc.data();
              if (data.cartId !== cart.id) return false;

              const rentalStart = new Date(data.startTime);
              const rentalEnd = new Date(data.endTime);

              return slotTime >= rentalStart && slotTime < rentalEnd;
            });

            statusMap.set(key, { status: hasConflict ? 'booked' : 'available' });
          });
        });

        setCellStatuses(statusMap);
      } catch (error) {
        console.error('Error loading availability:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [selectedDate, carts]);

  const handleSlotClick = (cart: GolfCart, time: string) => {
    const key = `${cart.id}-${time}`;
    const status = cellStatuses.get(key)?.status;
    if (status === 'available') {
      onCartSelect(cart);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Laster...</div>;
  }

  return (
    <div className="availability-container">
      <div className="availability-grid">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Tid</th>
              {carts.map(cart => (
                <th key={cart.id}>{cart.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.time}>
                <td className="cart-name-cell">{slot.time}</td>
                {carts.map(cart => {
                  const key = `${cart.id}-${slot.time}`;
                  const status = cellStatuses.get(key)?.status || 'available';

                  return (
                    <td key={key}>
                      <button
                        className={`time-slot ${status}`}
                        onClick={() => handleSlotClick(cart, slot.time)}
                        disabled={status === 'booked'}
                      >
                        {status === 'available' ? '●' : '✓'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AvailabilityGrid;
