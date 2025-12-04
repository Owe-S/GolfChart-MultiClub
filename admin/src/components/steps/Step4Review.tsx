import { useState } from 'react';
import type { BookingData } from '../../types';
import { calculatePrice } from '../../utils';
import { createRental } from '../../firebaseService';
import { PRICES, DOCTOR_NOTE_DISCOUNT } from '../../types';

interface Props {
    data: BookingData;
    onBack: () => void;
    onEdit?: (step: number) => void;
}

function Step4Review({ data, onBack, onEdit }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const basePrice = data.isMember ? PRICES.member[data.holes] : PRICES.nonMember[data.holes];
    const discount = data.hasDoctorsNote ? DOCTOR_NOTE_DISCOUNT : 0;
    const finalPrice = calculatePrice(data.isMember, data.hasDoctorsNote, data.holes);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const proposedStartTime = new Date(`${data.date}T${data.time}`);

            await createRental({
                cartId: data.cartId!,
                renterName: data.name,
                isMember: data.isMember,
                membershipNumber: data.membershipNumber || undefined,
                hasDoctorsNote: data.hasDoctorsNote,
                holes: data.holes,
                paymentMethod: null,
                notes: `Mobilbooking: ${data.cartName}`,
                price: finalPrice,
                startTime: proposedStartTime.toISOString(),
                endTime: null,
                notificationMethod: data.notificationMethod,
                contactInfo: data.contactInfo,
                reminderSent: false
            });

            setIsSuccess(true);
        } catch (error) {
            console.error('Booking error:', error);
            alert('Noe gikk galt. Prøv igjen.');
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="step-container success-state">
                <div className="success-icon">🎉</div>
                <h2 className="success-title">Bestillingen er bekreftet!</h2>
                
                <div className="success-details">
                    <div className="success-item">
                        <span className="success-label">Golfbil:</span>
                        <span className="success-value">{data.cartName}</span>
                    </div>
                    <div className="success-item">
                        <span className="success-label">Tidspunkt:</span>
                        <span className="success-value">{data.date} kl {data.time}</span>
                    </div>
                    <div className="success-item">
                        <span className="success-label">Varighet:</span>
                        <span className="success-value">{data.holes} hull</span>
                    </div>
                </div>

                <div className="success-confirmation">
                    <div className="confirmation-icon">✉️</div>
                    <p>Bekreftelse er sendt til <strong>{data.contactInfo}</strong></p>
                </div>

                <button 
                    type="button"
                    className="btn btn-primary btn-large" 
                    onClick={() => window.location.reload()}
                >
                    Bestill ny time
                </button>
            </div>
        );
    }

    return (
        <div className="step-container">
            <h2 className="card-title">✓ Bekreft Bestilling</h2>
            <p className="step-description">Sjekk at alt stemmer før du bekrefter</p>

            {/* Booking Summary */}
            <div className="review-card">
                <div className="review-section">
                    <div className="review-header">
                        <h3 className="review-title">📅 Tidspunkt & Bil</h3>
                        {onEdit && (
                            <button type="button" className="edit-btn" onClick={() => onEdit(1)}>
                                Endre
                            </button>
                        )}
                    </div>
                    <div className="review-content">
                        <div className="review-row">
                            <span className="review-label">Dato & tid:</span>
                            <span className="review-value">{data.date} kl {data.time}</span>
                        </div>
                        <div className="review-row">
                            <span className="review-label">Golfbil:</span>
                            <span className="review-value highlight">{data.cartName}</span>
                        </div>
                        <div className="review-row">
                            <span className="review-label">Antall hull:</span>
                            <span className="review-value">{data.holes} hull</span>
                        </div>
                    </div>
                </div>

                <div className="review-divider"></div>

                <div className="review-section">
                    <div className="review-header">
                        <h3 className="review-title">👤 Dine Opplysninger</h3>
                        {onEdit && (
                            <button type="button" className="edit-btn" onClick={() => onEdit(3)}>
                                Endre
                            </button>
                        )}
                    </div>
                    <div className="review-content">
                        <div className="review-row">
                            <span className="review-label">Navn:</span>
                            <span className="review-value">{data.name}</span>
                        </div>
                        <div className="review-row">
                            <span className="review-label">Kontakt:</span>
                            <span className="review-value">{data.contactInfo}</span>
                        </div>
                        <div className="review-row">
                            <span className="review-label">Status:</span>
                            <span className="review-value">
                                {data.isMember ? `Medlem (${data.membershipNumber})` : 'Gjest'}
                            </span>
                        </div>
                        {data.hasDoctorsNote && (
                            <div className="review-row">
                                <span className="review-label">Rabatt:</span>
                                <span className="review-value discount">Legeerklæring (-50 kr)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Price Summary */}
            <div className="price-summary-card">
                <h3 className="price-summary-title">💰 Prissammendrag</h3>
                <div className="price-breakdown-row">
                    <span>Basispris ({data.holes} hull)</span>
                    <span>{basePrice} kr</span>
                </div>
                {data.hasDoctorsNote && (
                    <div className="price-breakdown-row discount">
                        <span>Rabatt (legeerklæring)</span>
                        <span>-{discount} kr</span>
                    </div>
                )}
                <div className="price-summary-divider"></div>
                <div className="price-breakdown-row total">
                    <span className="total-text">Totalt å betale</span>
                    <span className="total-amount">{finalPrice} kr</span>
                </div>
                <p className="payment-note">
                    ℹ️ Betales i Proshop ved oppmøte
                </p>
            </div>

            {/* Terms & Conditions */}
            <div className="terms-section">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="checkbox-input"
                    />
                    <span>Jeg aksepterer vilkårene for utleie</span>
                </label>
            </div>

            {/* Actions */}
            <div className="step-actions">
                <button 
                    type="button"
                    className="btn btn-secondary" 
                    onClick={onBack} 
                    disabled={isSubmitting}
                >
                    ← Tilbake
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-large"
                    onClick={handleConfirm}
                    disabled={isSubmitting || !termsAccepted}
                >
                    {isSubmitting ? 'Bekrefter...' : '✓ Bekreft Bestilling'}
                </button>
            </div>
        </div>
    );
}

export default Step4Review;
