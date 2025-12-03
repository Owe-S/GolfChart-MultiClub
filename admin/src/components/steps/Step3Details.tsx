import type { BookingData } from '../BookingStepper';
import { calculatePrice } from '../../utils';

interface Props {
    data: BookingData;
    updateData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

function Step3Details({ data, updateData, onNext, onBack }: Props) {
    const price = calculatePrice(data.isMember, data.hasDoctorsNote, data.holes);

    const isValid = data.name && data.contactInfo &&
        (data.isMember ? data.membershipNumber : true);

    return (
        <div className="step-container">
            <h2 className="card-title">Dine Detaljer</h2>

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
                    <label className="input-label">
                        <input
                            type="checkbox"
                            checked={data.hasDoctorsNote}
                            onChange={e => updateData({ hasDoctorsNote: e.target.checked })}
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                        />
                        Jeg har legeerklæring
                    </label>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--ski-blue-dark)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Estimert pris:</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ski-gold)' }}>
                        {price},-
                    </span>
                </div>
            </div>

            <button
                className="btn btn-primary"
                onClick={onNext}
                disabled={!isValid}
                style={{ opacity: isValid ? 1 : 0.5 }}
            >
                Til Oppsummering
            </button>

            <button className="btn btn-text" onClick={onBack}>
                Tilbake
            </button>
        </div>
    );
}

export default Step3Details;
