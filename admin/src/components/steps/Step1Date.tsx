import type { BookingData } from '../BookingStepper';
import Calendar from '../Calendar';

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

    const isValid = data.date && data.time;

    return (
        <div className="step-container">
            <h2 className="card-title">Når vil du spille?</h2>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Velg dato</label>
                    <Calendar
                        selectedDate={data.date}
                        onDateChange={(date) => updateData({ date, time: '' })} // Reset time on date change
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Velg antall hull</label>
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
                    <label className="input-label">Velg starttid</label>
                    <div className="chip-grid">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                className={`chip ${data.time === time ? 'selected' : ''}`}
                                onClick={() => updateData({ time })}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                className="btn btn-primary"
                onClick={onNext}
                disabled={!isValid}
                style={{ opacity: isValid ? 1 : 0.5 }}
            >
                Neste: Velg Bil
            </button>
        </div>
    );
}

export default Step1Date;
