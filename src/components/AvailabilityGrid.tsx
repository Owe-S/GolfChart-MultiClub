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

// Generate 10-minute interval slots: 6 slots per hour
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 10; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ label: timeStr, time: timeStr });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

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

            // Check if any rental (including charging period) conflicts with this time slot
            const hasConflict = Array.from(snapshot.docs).some(doc => {
              const data = doc.data();
              if (data.cartId !== cart.id || data.status === 'cancelled') return false;

              const rentalStart = new Date(data.startTime);
              // Use chargingEndTime if available, otherwise fall back to endTime
              const rentalEnd = data.chargingEndTime ? new Date(data.chargingEndTime) : new Date(data.endTime);

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
