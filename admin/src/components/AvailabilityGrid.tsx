import { useEffect, useState, useCallback } from 'react';
import { getRentals, getCarts } from '../firebaseService';
import { PLAY_DURATION, CHARGE_DURATION } from '../types';
import type { GolfCart, Rental } from '../types';
import '../ski-gk-theme.css';

interface TimeSlot {
    hour: number;
    minute: number;
    label: string;
}

interface CellStatus {
    cartId: number;
    timeSlot: TimeSlot;
    status: 'available' | 'booked' | 'charging';
    rentalId?: string;
    rental?: Rental;
}

interface AvailabilityGridProps {
    selectedDate?: string;
    onSlotSelect?: (cart: GolfCart, time: string) => void;
    holes?: 9 | 18;
}

// Generate time slots (10-minute intervals from 10:00 to 20:00)
function generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let hour = 10; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            if (hour === 20 && minute > 0) break; // Stop at 20:00
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push({
                hour,
                minute,
                label: `${h}:${m}`
            });
        }
    }
    return slots;
}

function AvailabilityGrid({ selectedDate, onSlotSelect }: AvailabilityGridProps) {
    const [carts, setCarts] = useState<GolfCart[]>([]);
    const [cellStatuses, setCellStatuses] = useState<Map<string, CellStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const timeSlots = generateTimeSlots();
    const displayDate = selectedDate || new Date().toISOString().split('T')[0];

    // Load carts once on mount
    useEffect(() => {
        async function loadCarts() {
            try {
                const cartsData = await getCarts();
                setCarts(cartsData.sort((a, b) => a.id - b.id));
            } catch (error) {
                console.error('Error loading carts:', error);
            }
        }
        loadCarts();
    }, []);

    // Memoize loader to satisfy exhaustive-deps and avoid re-creating
    const loadAvailabilityData = useCallback(async () => {
        setLoading(true);
        try {
            // Get rentals for the selected date
            const rentals = await getRentals({
                date: displayDate
            });

            // Build status map
            const statusMap = new Map<string, CellStatus>();

            carts.forEach(cart => {
                timeSlots.forEach(slot => {
                    const key = `${cart.id}-${slot.label}`;
                    const slotTime = new Date(`${displayDate}T${slot.label}:00`);

                    // Check if this slot conflicts with any rental
                    const conflictingRental = rentals.find(rental => {
                        if (rental.cartId !== cart.id) return false;

                        const rentalStart = rental.startTime.toDate();
                        const rentalDuration = PLAY_DURATION[rental.holes] + CHARGE_DURATION[rental.holes];
                        const rentalEnd = new Date(rentalStart.getTime() + rentalDuration * 60 * 1000);

                        const slotEnd = new Date(slotTime.getTime() + 10 * 60 * 1000);

                        // Check if slot overlaps with rental
                        return slotTime < rentalEnd && slotEnd > rentalStart;
                    });

                    if (conflictingRental) {
                        // Determine if it's booked (playing) or charging
                        const rentalStart = conflictingRental.startTime.toDate();
                        const playEnd = new Date(rentalStart.getTime() + PLAY_DURATION[conflictingRental.holes] * 60 * 1000);

                        const status = slotTime < playEnd ? 'booked' : 'charging';

                        statusMap.set(key, {
                            cartId: cart.id,
                            timeSlot: slot,
                            status,
                            rentalId: conflictingRental.id,
                            rental: conflictingRental
                        });
                    } else {
                        // Check if we can book this slot (is there enough time?)
                        // For now, just mark as available. 
                        // Real implementation should check if *future* slots are free for the duration.
                        statusMap.set(key, {
                            cartId: cart.id,
                            timeSlot: slot,
                            status: 'available'
                        });
                    }
                });
            });

            setCellStatuses(statusMap);
        } catch (error) {
            console.error('Error loading availability data:', error);
        } finally {
            setLoading(false);
        }
    }, [displayDate, carts, timeSlots]);

    // Load availability when date or carts change
    useEffect(() => {
        if (carts.length > 0) {
            loadAvailabilityData();
        }
    }, [loadAvailabilityData, carts.length]);

    function handleCellClick(cart: GolfCart, timeSlot: TimeSlot) {
        const key = `${cart.id}-${timeSlot.label}`;
        const status = cellStatuses.get(key);

        // If status is undefined, it means no rental found, so it's available (default)
        // OR if explicitly marked available
        if (!status || status.status === 'available') {
            if (onSlotSelect) {
                console.log('Slot selected:', cart.name, timeSlot.label);
                onSlotSelect(cart, timeSlot.label);
            }
        } else if (status.status === 'booked' || status.status === 'charging') {
            console.log('Show rental details for:', status.rentalId);
        }
    }

    function handleCellMouseEnter(event: React.MouseEvent<HTMLDivElement>, key: string) {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
        setHoveredCell(key);
    }

    function handleCellMouseLeave() {
        setHoveredCell(null);
    }

    if (loading) {
        return (
            <div className="ski-text-center ski-mt-lg">
                <div className="ski-spinner"></div>
                <p>Laster tilgjengelighet...</p>
            </div>
        );
    }

    return (
        <div className="ski-availability-grid">
            {/* Header row */}
            <div className="ski-grid-header"></div>
            {carts.map(cart => (
                <div key={cart.id} className="ski-grid-header">
                    {cart.name}
                </div>
            ))}

            {/* Time slot rows */}
            {timeSlots.map(slot => (
                <div key={slot.label} className="ski-grid-row-contents">
                    <div className="ski-grid-time">{slot.label}</div>
                    {carts.map(cart => {
                        const key = `${cart.id}-${slot.label}`;
                        const status = cellStatuses.get(key);

                        return (
                            <div
                                key={key}
                                className={`ski-grid-cell ${status?.status || 'available'}`}
                                onClick={() => handleCellClick(cart, slot)}
                                onMouseEnter={(e) => handleCellMouseEnter(e, key)}
                                onMouseLeave={handleCellMouseLeave}
                                title={status?.status === 'available' ? 'Ledig' : status?.status === 'booked' ? 'Opptatt' : 'Lader'}
                            />
                        );
                    })}
                </div>
            ))}

            {/* Tooltip */}
            {hoveredCell && cellStatuses.get(hoveredCell)?.rental && (
                <div
                    className="availability-tooltip"
                    data-x={tooltipPosition.x}
                    data-y={tooltipPosition.y}
                >
                    {(() => {
                        const rental = cellStatuses.get(hoveredCell)?.rental;
                        if (!rental) return null;

                        const startTime = rental.startTime.toDate();
                        const endTime = new Date(startTime.getTime() + 
                            (PLAY_DURATION[rental.holes] + CHARGE_DURATION[rental.holes]) * 60 * 1000);

                        return (
                            <div className="tooltip-content">
                                <div className="tooltip-header">
                                    <strong>{rental.renterName}</strong>
                                    {rental.isMember && <span className="tooltip-badge">Medlem</span>}
                                </div>
                                <div className="tooltip-body">
                                    <div className="tooltip-row">
                                        <span className="tooltip-icon">📞</span>
                                        <span>{rental.phone}</span>
                                    </div>
                                    {rental.email && (
                                        <div className="tooltip-row">
                                            <span className="tooltip-icon">✉️</span>
                                            <span>{rental.email}</span>
                                        </div>
                                    )}
                                    <div className="tooltip-row">
                                        <span className="tooltip-icon">⛳</span>
                                        <span>{rental.holes} hull</span>
                                    </div>
                                    <div className="tooltip-row">
                                        <span className="tooltip-icon">⏰</span>
                                        <span>
                                            {startTime.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                                            {' - '}
                                            {endTime.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="tooltip-row">
                                        <span className="tooltip-icon">💰</span>
                                        <span>{rental.price} kr</span>
                                    </div>
                                    {rental.hasDoctorsNote && (
                                        <div className="tooltip-note">
                                            <span className="tooltip-icon">🏥</span>
                                            <span>Legeerklæring</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

export default AvailabilityGrid;
