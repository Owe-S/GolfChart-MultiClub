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
    membershipNumber: '',
    isMember: false,
    holes: 18,
    startTime: '10:00',
    endTime: '14:00',
    phone: '',
    email: '',
    notes: '',
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'holes') {
      newValue = parseInt(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-calculate end time based on holes
    if (name === 'holes') {
      const hours = parseInt(value) === 18 ? 4 : 2;
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(start.getTime() + hours * 60 * 60000);
      const endTime = end.toTimeString().slice(0, 5);
      setFormData(prev => ({
        ...prev,
        endTime
      }));
    }

    // Auto-calculate end time if start time changes
    if (name === 'startTime') {
      const hours = formData.holes === 18 ? 4 : 2;
      const start = new Date(`2000-01-01T${value}:00`);
      const end = new Date(start.getTime() + hours * 60 * 60000);
      const endTime = end.toTimeString().slice(0, 5);
      setFormData(prev => ({
        ...prev,
        endTime
      }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    if (!formData.renterName.trim()) {
      alert('Legg inn navn');
      return;
    }
    
    if (!formData.phone.trim()) {
      alert('Legg inn telefonnummer');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${selectedDate}T${formData.endTime}:00`).toISOString();

    onSubmit({
      renterName: formData.renterName,
      membershipNumber: formData.membershipNumber || null,
      isMember: formData.isMember,
      holes: formData.holes,
      startTime: startDateTime,
      endTime: endDateTime,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      price: formData.holes === 18 ? 450 : 250,
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
          <h3>📋 Leietakers informasjon</h3>
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

          <div className="form-group checkbox">
            <input
              id="isMember"
              type="checkbox"
              name="isMember"
              checked={formData.isMember}
              onChange={handleChange}
            />
            <label htmlFor="isMember">Jeg er medlem av klubben</label>
          </div>

          {formData.isMember && (
            <div className="form-group">
              <label htmlFor="membershipNumber">GolfBox medlemsnummer</label>
              <input
                id="membershipNumber"
                type="text"
                name="membershipNumber"
                placeholder="f.eks. 73-10524"
                value={formData.membershipNumber}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>⛳ Golfbil og tid</h3>
          
          <div className="form-group">
            <label>Valgt bil</label>
            <input
              type="text"
              value={cart.name}
              disabled
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Dato</label>
            <input
              type="text"
              value={selectedDate}
              disabled
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
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

          <div className="form-group">
            <label htmlFor="endTime">Sluttid</label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              value={formData.endTime}
              disabled
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
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
