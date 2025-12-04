import { Link } from 'react-router-dom';
import '../ski-gk-theme.css';

function ReportsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Rapporter</h1>
      </div>

      <div className="reports-grid">
        <Link to="/reports/revenue" className="report-card-link">
          <div className="report-card">
            <div className="report-icon">💰</div>
            <h3>Inntektsrapport</h3>
            <p>Vis inntekter over tid</p>
            <button className="btn-primary">Åpne Rapport</button>
          </div>
        </Link>

        <Link to="/reports/analytics" className="report-card-link">
          <div className="report-card">
            <div className="report-icon">📊</div>
            <h3>Bookinganalyse</h3>
            <p>Populære tider og mønstre</p>
            <button className="btn-primary">Åpne Rapport</button>
          </div>
        </Link>

        <Link to="/reports/performance" className="report-card-link">
          <div className="report-card">
            <div className="report-icon">🚗</div>
            <h3>Bilutnyttelse</h3>
            <p>Hvor mye brukes hver bil</p>
            <button className="btn-primary">Åpne Rapport</button>
          </div>
        </Link>

        <Link to="/reports/statistics" className="report-card-link">
          <div className="report-card">
            <div className="report-icon">👥</div>
            <h3>Spillerdata & Statistikk</h3>
            <p>Spiller og bilstatistikk</p>
            <button className="btn-primary">Åpne Rapport</button>
          </div>
        </Link>

        <div className="report-card">
          <div className="report-icon">📈</div>
          <h3>Trendanalyse</h3>
          <p>Vekst og utvikling</p>
          <button className="btn-primary">Generer Rapport</button>
        </div>
      </div>

      <div className="info-box">
        <h3>📋 Kommende Funksjonalitet</h3>
        <p>Rapportmodulen er under utvikling. Her vil du kunne:</p>
        <ul>
          <li>Generere detaljerte inntektsrapporter</li>
          <li>Analysere bookingmønstre og trender</li>
          <li>Overvåke bilutnyttelse og vedlikehold</li>
          <li>Eksportere data til CSV og PDF</li>
          <li>Planlegge automatiske rapporter via e-post</li>
        </ul>
      </div>
    </div>
  );
}

export default ReportsPage;
