import '../ski-gk-theme.css';

interface ErrorStateCardProps {
  icon?: string;
  title?: string;
  message?: string;
}

function ErrorStateCard({ 
  icon = '⚠️', 
  title = 'Noe gikk galt',
  message = 'Kunne ikke laste data. Prøv igjen.'
}: ErrorStateCardProps) {
  return (
    <div className="error-state-card">
      <div className="error-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default ErrorStateCard;
