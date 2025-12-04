import { useEffect, useState } from 'react';
import type { BookingData } from '../../types';
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
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

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

    const filteredCarts = showOnlyAvailable 
        ? carts.filter(cart => availabilityMap[cart.id])
        : carts;

    const availableCount = Object.values(availabilityMap).filter(Boolean).length;

    if (loading) {
        return (
            <div className="step-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Sjekker tilgjengelighet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="step-container">
            <h2 className="card-title">🚗 Velg Golfbil</h2>
            <p className="step-description">
                {data.date} kl {data.time} • {data.holes} hull • {availableCount} av {carts.length} ledige
            </p>

            {/* Filter Toggle */}
            <div className="filter-section">
                <label className="filter-toggle">
                    <input 
                        type="checkbox"
                        checked={showOnlyAvailable}
                        onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    />
                    <span className="filter-label">Vis kun ledige biler</span>
                </label>
            </div>

            {/* Cart Grid */}
            <div className="cart-grid">
                {filteredCarts.map(cart => {
                    const isAvailable = availabilityMap[cart.id];
                    const isSelected = data.cartId === cart.id;
                    
                    return (
                        <button
                            key={cart.id}
                            type="button"
                            className={`cart-card ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
                            disabled={!isAvailable}
                            onClick={() => handleSelectCart(cart)}
                        >
                            {/* Cart Icon */}
                            <div className="cart-icon">
                                🚗
                            </div>

                            {/* Cart Info */}
                            <div className="cart-info">
                                <h3 className="cart-name">{cart.name}</h3>
                                <div className={`cart-status ${isAvailable ? 'available' : cart.status === 'out_of_order' ? 'occupied' : 'occupied'}`}>
                                    <span className="status-dot"></span>
                                    <span className="status-text">
                                        {isAvailable ? 'Ledig' : cart.status === 'out_of_order' ? 'Ute av drift' : 'Opptatt'}
                                    </span>
                                </div>
                            </div>

                            {/* Selection Indicator */}
                            {isAvailable && (
                                <div className="cart-action">
                                    {isSelected ? '✓' : '→'}
                                </div>
                            )}

                            {/* Unavailable Overlay */}
                            {!isAvailable && (
                                <div className="cart-overlay">
                                    <span className="overlay-text">Ikke tilgjengelig</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredCarts.length === 0 && (
                <div className="empty-cart-state">
                    <div className="empty-icon">🔍</div>
                    <p>Ingen biler matcher dine kriterier</p>
                    <button 
                        type="button"
                        className="btn btn-text" 
                        onClick={() => setShowOnlyAvailable(false)}
                    >
                        Vis alle biler
                    </button>
                </div>
            )}

            {/* Navigation */}
            <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={onBack}>
                    ← Tilbake
                </button>
            </div>
        </div>
    );
}

export default Step2Cart;
