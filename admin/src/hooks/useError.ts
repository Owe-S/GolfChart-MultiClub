import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  details?: string;
  retry?: () => void;
}

export function useError() {
  const [error, setError] = useState<ErrorState | null>(null);

  const setErrorMessage = useCallback((
    message: string,
    details?: string,
    retry?: () => void
  ) => {
    setError({ message, details, retry });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    console.error('Error:', err);
    
    let message = 'En feil oppstod';
    let details = undefined;

    if (err instanceof Error) {
      message = err.message;
      details = err.stack;
    } else if (typeof err === 'string') {
      message = err;
    }

    setError({ message, details });
  }, []);

  return {
    error,
    setErrorMessage,
    clearError,
    handleError,
  };
}
