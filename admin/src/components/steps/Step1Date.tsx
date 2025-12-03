import type { BookingData } from '../BookingStepper';
import Calendar from '../Calendar';
import { calculatePrice } from '../../utils';

interface Props {
    data: BookingData;
    updateData: (data: Partial<BookingData>) => void;
    onNext: () => void;
}

function Step1Date({ data, updateData, onNext }: Props) {
    // Generate time slots
    const timeSlots = [];
    for (let h = 10; h <= 19; h++) {
        for (let m = 0; m < 60; m += 10) {
            timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }

    const isValid = data.date && data.time && data.holes;

    // Calculate estimated price for preview
    const memberPrice = calculatePrice(true, false, data.holes);
    const nonMemberPrice = calculatePrice(false, false, data.holes);

    return (
        <div className="step-container">
            <h2 className="card-title">📅 Når & Varighet</h2>
            <p className="step-description">Velg dato, tid og hvor lenge du vil spille</p>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Velg dato</label>
                    <Calendar
                        selectedDate={data.date}
                        onDateChange={(date) => updateData({ date, time: '' })} // Reset time on date change
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Antall hull</label>
                    <div className="hole-selector">
                        <button
                            type="button"
                            className={`hole-option ${data.holes === 18 ? 'selected' : ''}`}
                            onClick={() => updateData({ holes: 18 })}
                        >
                            <div className="hole-number">18</div>
                            <div className="hole-label">Hull</div>
                            <div className="hole-duration">~4 timer</div>
                            <div className="hole-price">Fra {memberPrice} kr</div>
                        </button>
                        <button
                            type="button"
                            className={`hole-option ${data.holes === 9 ? 'selected' : ''}`}
                            onClick={() => updateData({ holes: 9 })}
                        >
                            <div className="hole-number">9</div>
                            <div className="hole-label">Hull</div>
                            <div className="hole-duration">~2 timer</div>
                            <div className="hole-price">Fra {calculatePrice(true, false, 9)} kr</div>
                        </button>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Velg starttid</label>
                    <div className="chip-grid">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                type="button"
                                className={`chip ${data.time === time ? 'selected' : ''}`}
                                onClick={() => updateData({ time })}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {data.holes && (
                    <div className="price-preview">
                        <div className="price-row">
                            <span>💰 Estimert pris:</span>
                            <span className="price-range">
                                {memberPrice} kr (medlem) - {nonMemberPrice} kr (ikke-medlem)
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={onNext}
                disabled={!isValid}
            >
                Neste: Velg Bil →
            </button>
        </div>
    );
}

export default Step1Date;
