import { useState } from 'react';
import type { GolfCart } from '../types';

interface BookingFormProps {
  cart: GolfCart | null;
  selectedDate: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function BookingForm({ cart, selectedDate, onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    renterName: '',
    playerId: '',
    holes: 18,
    startTime: '10:00',
    endTime: '14:20',
    chargingEndTime: '15:10',
    phone: '',
    email: '',
    notes: '',
  });

  const [playerIdError, setPlayerIdError] = useState('');

  // Calculate duration and charging period based on holes
  const calculateEndTimes = (holes: number, startTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    let endTime: Date;
    let chargingEndTime: Date;

    if (holes === 18) {
      // 18 holes: 4h 20min play + 50min charging = 5h 10min total
      endTime = new Date(start.getTime() + 4 * 60 * 60000 + 20 * 60000);
      chargingEndTime = new Date(endTime.getTime() + 50 * 60000);
    } else {
      // 9 holes: 2h 10min play + 30min charging = 2h 40min total
      endTime = new Date(start.getTime() + 2 * 60 * 60000 + 10 * 60000);
      chargingEndTime = new Date(endTime.getTime() + 30 * 60000);
    }

    return {
      endTime: endTime.toTimeString().slice(0, 5),
      chargingEndTime: chargingEndTime.toTimeString().slice(0, 5),
    };
  };

  const validatePlayerId = (id: string): boolean => {
    // Format: 3 digits - 7 digits (e.g., 073-1234567)
    const playerIdRegex = /^\d{3}-\d{7}$/;
    return playerIdRegex.test(id);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate player ID format on change
    if (name === 'playerId') {
      if (value && !validatePlayerId(value)) {
        setPlayerIdError('Format: 3 siffer-7 siffer (f.eks. 073-1234567)');
      } else {
        setPlayerIdError('');
      }
    }

    // Auto-calculate end times based on holes or start time
    if (name === 'holes' || name === 'startTime') {
      const holes = name === 'holes' ? parseInt(value) : formData.holes;
      const startTime = name === 'startTime' ? value : formData.startTime;
      const { endTime, chargingEndTime } = calculateEndTimes(holes, startTime);
      setFormData(prev => ({
        ...prev,
        endTime,
        chargingEndTime,
      }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    if (!formData.renterName.trim()) {
      alert('Legg inn navn');
      return;
    }
    
    if (!formData.playerId.trim()) {
      alert('Legg inn spiller-ID');
      return;
    }

    if (!validatePlayerId(formData.playerId)) {
      alert('Ugyldig spiller-ID format (bruk f.eks. 073-1234567)');
      return;
    }
    
    if (!formData.phone.trim()) {
      alert('Legg inn telefonnummer');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${selectedDate}T${formData.endTime}:00`).toISOString();
    const chargingEndDateTime = new Date(`${selectedDate}T${formData.chargingEndTime}:00`).toISOString();

    onSubmit({
      renterName: formData.renterName,
      playerId: formData.playerId,
      holes: formData.holes,
      startTime: startDateTime,
      endTime: endDateTime,
      chargingEndTime: chargingEndDateTime,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      price: formData.holes === 18 ? 450 : 250,
      status: 'confirmed',
    });
  };

  if (!cart) {
    return (
      <div className="booking-form">
        <p>Velg en golfbil for å fortsette.</p>
      </div>
    );
  }

  const price = formData.holes === 18 ? 450 : 250;

  return (
    <div className="booking-form">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>📋 Spiller og leieinformasjon</h3>
          <div className="form-group">
            <label htmlFor="renterName">Navn *</label>
            <input
              id="renterName"
              type="text"
              name="renterName"
              placeholder="Skriv inn navn"
              value={formData.renterName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="playerId">Spiller-ID *</label>
            <input
              id="playerId"
              type="text"
              name="playerId"
              placeholder="f.eks. 073-1234567"
              value={formData.playerId}
              onChange={handleChange}
              required
            />
            {playerIdError && <div className="error-text">{playerIdError}</div>}
          </div>
        </div>

        <div className="form-section">
          <h3>⛳ Golfbil og tid</h3>
          
          <div className="form-group">
            <label>Valgt bil</label>
            <input
              type="text"
              value={cart.name}
              disabled
              className="disabled-input"
              title="Selected golf cart (read-only)"
            />
          </div>

          <div className="form-group">
            <label>Dato</label>
            <input
              type="text"
              value={selectedDate}
              disabled
              className="disabled-input"
              title="Selected date (read-only)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="holes">Antall hull</label>
              <select
                id="holes"
                name="holes"
                value={formData.holes}
                onChange={handleChange}
              >
                <option value="9">9 hull</option>
                <option value="18">18 hull</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Starttid</label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endTime">Sluttid (inkl. spilling)</label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                value={formData.endTime}
                disabled
                className="disabled-input"
              />
              <small className="helper-text">
                {formData.holes === 18 ? '4h 20min' : '2h 10min'} spilletid
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="chargingEndTime">Klar for neste booking</label>
              <input
                id="chargingEndTime"
                type="time"
                name="chargingEndTime"
                value={formData.chargingEndTime}
                disabled
                className="disabled-input"
              />
              <small className="helper-text">
                +{formData.holes === 18 ? '50' : '30'} min lading
              </small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>💰 Pris</h3>
          <div className="pricing-info">
            <p>Medlemspris – 18 hull / 9 hull: <strong>450 kr / 250 kr</strong></p>
            <div className="estimated-price">Totalt: {price} kr</div>
          </div>
        </div>

        <div className="form-section">
          <h3>📞 Kontaktinformasjon</h3>
          
          <div className="form-group">
            <label htmlFor="phone">Telefonnummer *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="f.eks. 98765432"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-postadresse</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="din@email.no"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>💬 Kommentar</h3>
          <div className="form-group">
            <textarea
              name="notes"
              placeholder="Legg til kommentar eller spesiell forespørsel (valgfritt)"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Avbryt
          </button>
          <button type="submit" className="btn-primary">
            Registrer booking
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;
