interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  showIcon?: boolean;
}

function Alert({ type, title, message, onClose, showIcon = true }: AlertProps) {
  const icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`${type}-alert`}>
      {showIcon && (
        <div className={`${type}-alert-icon`}>{icons[type]}</div>
      )}
      <div className={`${type}-alert-content`}>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
      </div>
      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.25rem', 
            cursor: 'pointer',
            padding: 0,
            minHeight: 'auto',
            minWidth: 'auto',
            color: 'inherit',
            opacity: 0.7
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;
