import { useEffect, useRef } from 'react';
import '../ski-gk-theme.css';

interface Step {
  number: number;
  title: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

function ProgressSteps({ currentStep, totalSteps, onStepClick }: ProgressStepsProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  
  const stepTitles = [
    { title: 'Når & Varighet', icon: '📅' },
    { title: 'Velg Bil', icon: '🚗' },
    { title: 'Dine Detaljer', icon: '📝' },
    { title: 'Bekreft', icon: '✓' }
  ];

  const steps: Step[] = stepTitles.map((step, index) => {
    const stepNumber = index + 1;
    let status: 'completed' | 'current' | 'upcoming';
    
    if (stepNumber < currentStep) {
      status = 'completed';
    } else if (stepNumber === currentStep) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return {
      number: stepNumber,
      title: step.title,
      icon: step.icon,
      status
    };
  });

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${progressPercentage / 100})`;
    }
  }, [progressPercentage]);

  const handleStepClick = (stepNumber: number) => {
    // Only allow going back to completed steps
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="progress-steps-container">
      {/* Progress bar background */}
      <div className="progress-track">
        <div 
          ref={progressRef}
          className="progress-fill"
        />
      </div>

      {/* Step indicators */}
      <div className="steps-row">
        {steps.map((step) => (
          <div key={step.number} className="step-wrapper">
            <button
              type="button"
              className={`step-circle ${step.status} ${step.status === 'completed' ? 'clickable' : ''}`}
              onClick={() => handleStepClick(step.number)}
              disabled={step.status !== 'completed'}
              aria-label={`Step ${step.number}: ${step.title}`}
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              {step.status === 'completed' ? (
                <span className="step-icon completed-icon">✓</span>
              ) : (
                <span className="step-icon">{step.icon}</span>
              )}
            </button>
            <div className="step-label">
              <div className="step-number">Steg {step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressSteps;
