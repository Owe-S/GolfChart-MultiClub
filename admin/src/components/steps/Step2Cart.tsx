import { useEffect, useState } from 'react';
import type { BookingData } from '../BookingStepper';
import { checkAvailability, getCarts } from '../../firebaseService';
import type { GolfCart } from '../../types';

interface Props {
    data: BookingData;
    updateData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

function Step2Cart({ data, updateData, onNext, onBack }: Props) {
    const [carts, setCarts] = useState<GolfCart[]>([]);
    const [loading, setLoading] = useState(true);
    const [availabilityMap, setAvailabilityMap] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Get all carts
                const allCarts = await getCarts();
                setCarts(allCarts);

                // 2. Check availability
                const availability = await checkAvailability(data.date, data.time, data.holes);

                const map: Record<number, boolean> = {};
                allCarts.forEach(cart => {
                    map[cart.id] = availability.availableCartIds.includes(cart.id);
                });
                setAvailabilityMap(map);

            } catch (error) {
                console.error("Error loading carts", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [data.date, data.time, data.holes]);

    const handleSelectCart = (cart: GolfCart) => {
        updateData({ cartId: cart.id, cartName: cart.name });
        onNext();
    };

    if (loading) {
        return <div className="text-center p-4">Sjekker tilgjengelighet...</div>;
    }

    return (
        <div className="step-container">
            <h2 className="card-title">Velg Golfbil</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
                {data.date} kl {data.time} ({data.holes} hull)
            </p>

            <div className="cart-list">
                {carts.map(cart => {
                    const isAvailable = availabilityMap[cart.id];
                    return (
                        <div
                            key={cart.id}
                            className="card"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `6px solid ${isAvailable ? 'var(--status-available-text)' : 'var(--status-booked-text)'}`
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{cart.name}</h3>
                                <span style={{
                                    fontSize: '14px',
                                    color: isAvailable ? 'var(--status-available-text)' : 'var(--status-booked-text)',
                                    fontWeight: 'bold'
                                }}>
                                    {isAvailable ? 'Ledig' : 'Opptatt'}
                                </span>
                            </div>

                            <button
                                className="btn"
                                style={{
                                    width: 'auto',
                                    padding: '0 24px',
                                    backgroundColor: isAvailable ? 'var(--ski-gold)' : '#eee',
                                    color: isAvailable ? 'var(--ski-blue-dark)' : '#999',
                                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                                }}
                                disabled={!isAvailable}
                                onClick={() => handleSelectCart(cart)}
                            >
                                Velg
                            </button>
                        </div>
                    );
                })}
            </div>

            <button className="btn btn-text" onClick={onBack}>
                Tilbake
            </button>
        </div>
    );
}

export default Step2Cart;
