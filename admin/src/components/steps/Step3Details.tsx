import type { BookingData } from '../BookingStepper';
import { calculatePrice } from '../../utils';
import { PRICES, DOCTOR_NOTE_DISCOUNT } from '../../types';

interface Props {
    data: BookingData;
    updateData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

function Step3Details({ data, updateData, onNext, onBack }: Props) {
    const basePrice = data.isMember ? PRICES.member[data.holes] : PRICES.nonMember[data.holes];
    const discount = data.hasDoctorsNote ? DOCTOR_NOTE_DISCOUNT : 0;
    const finalPrice = calculatePrice(data.isMember, data.hasDoctorsNote, data.holes);

    const isValid = data.name && data.contactInfo &&
        (data.isMember ? data.membershipNumber : true);

    return (
        <div className="step-container">
            <h2 className="card-title">📝 Dine Detaljer</h2>
            <p className="step-description">Fyll inn informasjonen din og bekreft prisen</p>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Antall Hull</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className={`chip ${data.holes === 18 ? 'selected' : ''}`}
                            onClick={() => updateData({ holes: 18 })}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            18 Hull
                        </button>
                        <button
                            className={`chip ${data.holes === 9 ? 'selected' : ''}`}
                            onClick={() => updateData({ holes: 9 })}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            9 Hull
                        </button>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Fullt Navn</label>
                    <input
                        type="text"
                        className="input-field"
                        value={data.name}
                        onChange={e => updateData({ name: e.target.value })}
                        placeholder="Ola Nordmann"
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Er du medlem i Ski GK?</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className={`chip ${data.isMember ? 'selected' : ''}`}
                            onClick={() => updateData({ isMember: true })}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            Ja, medlem
                        </button>
                        <button
                            className={`chip ${!data.isMember ? 'selected' : ''}`}
                            onClick={() => updateData({ isMember: false })}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            Nei, gjest
                        </button>
                    </div>
                </div>

                {data.isMember && (
                    <div className="input-group">
                        <label className="input-label">Medlemsnummer (GolfBox)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={data.membershipNumber}
                            onChange={e => updateData({ membershipNumber: e.target.value })}
                            placeholder="73-12345"
                        />
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label">Kontaktinfo ({data.notificationMethod})</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button
                            className={`chip ${data.notificationMethod === 'email' ? 'selected' : ''}`}
                            onClick={() => updateData({ notificationMethod: 'email' })}
                            style={{ flex: 1 }}
                        >
                            E-post
                        </button>
                        <button
                            className={`chip ${data.notificationMethod === 'sms' ? 'selected' : ''}`}
                            onClick={() => updateData({ notificationMethod: 'sms' })}
                            style={{ flex: 1 }}
                        >
                            SMS
                        </button>
                    </div>
                    <input
                        type={data.notificationMethod === 'email' ? 'email' : 'tel'}
                        className="input-field"
                        value={data.contactInfo}
                        onChange={e => updateData({ contactInfo: e.target.value })}
                        placeholder={data.notificationMethod === 'email' ? 'ola@eksempel.no' : '900 00 000'}
                    />
                </div>

                <div className="input-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={data.hasDoctorsNote}
                            onChange={e => updateData({ hasDoctorsNote: e.target.checked })}
                            className="checkbox-input"
                        />
                        <span>Jeg har legeerklæring (50 kr rabatt)</span>
                    </label>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="price-breakdown-card">
                <h3 className="price-breakdown-title">💰 Prisberegning</h3>
                <div className="price-row">
                    <span>Basispris ({data.holes} hull)</span>
                    <span className="price-value">{basePrice} kr</span>
                </div>
                {data.hasDoctorsNote && (
                    <div className="price-row discount">
                        <span>Rabatt (legeerklæring)</span>
                        <span className="price-value">-{discount} kr</span>
                    </div>
                )}
                <div className="price-divider"></div>
                <div className="price-row total">
                    <span className="total-label">Totalt å betale</span>
                    <span className="total-value">{finalPrice} kr</span>
                </div>
                <div className="price-note">
                    {data.isMember ? '✓ Medlemspris' : 'Gjestepris'}
                </div>
            </div>

            {/* Navigation */}
            <div className="step-actions">
                <button 
                    type="button"
                    className="btn btn-secondary" 
                    onClick={onBack}
                >
                    ← Tilbake
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-large"
                    onClick={onNext}
                    disabled={!isValid}
                >
                    Til Oppsummering →
                </button>
            </div>
        </div>
    );
}

export default Step3Details;
