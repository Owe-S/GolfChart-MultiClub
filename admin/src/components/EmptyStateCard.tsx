import '../ski-gk-theme.css';

interface EmptyStateCardProps {
  icon?: string;
  title?: string;
  message?: string;
}

function EmptyStateCard({ 
  icon = '📭', 
  title = 'Ingen data funnet',
  message = 'Dette er ikke en feil. Prøv en annen dato eller juster filteret.'
}: EmptyStateCardProps) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyStateCard;
