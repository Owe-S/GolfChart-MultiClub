import { useState } from 'react';
import type { BookingData } from '../BookingStepper';
import { calculatePrice } from '../../utils';
import { createRental } from '../../firebaseService';

interface Props {
    data: BookingData;
    onBack: () => void;
}

function Step4Review({ data, onBack }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const price = calculatePrice(data.isMember, data.hasDoctorsNote, data.holes);

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
                price,
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
            <div className="step-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                <h2 className="card-title" style={{ fontSize: '24px' }}>Takk for din bestilling!</h2>
                <p>Du har booket <strong>{data.cartName}</strong></p>
                <p>{data.date} kl {data.time}</p>
                <div className="card" style={{ marginTop: '30px', backgroundColor: 'var(--status-available-bg)' }}>
                    <p style={{ color: 'var(--status-available-text)', fontWeight: 'bold' }}>
                        Bekreftelse er sendt til {data.contactInfo}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Bestill ny time
                </button>
            </div>
        );
    }

    return (
        <div className="step-container">
            <h2 className="card-title">Se over og bekreft</h2>

            <div className="card">
                <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Tidspunkt</label>
                    <div style={{ fontSize: '18px' }}>{data.date} kl {data.time}</div>
                    <div style={{ color: '#666' }}>{data.holes} hull</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Golfbil</label>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.cartName}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Leietaker</label>
                    <div>{data.name}</div>
                    <div>{data.contactInfo}</div>
                    {data.isMember && <div>Medlem: {data.membershipNumber}</div>}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                        <span>Total pris:</span>
                        <span>{price},-</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Betales i Proshop ved oppmøte
                    </div>
                </div>
            </div>

            <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Bekrefter...' : 'Bekreft Bestilling'}
            </button>

            <button className="btn btn-text" onClick={onBack} disabled={isSubmitting}>
                Tilbake
            </button>
        </div>
    );
}

export default Step4Review;
