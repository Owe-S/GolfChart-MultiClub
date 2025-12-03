import '../ski-gk-theme.css';

// Step Components
import Step3Details from './steps/Step3Details';
import Step4Review from './steps/Step4Review';

export interface BookingData {
    date: string;
    time: string;
    holes: 9 | 18;
    cartId: number | null;
    cartName: string;
    name: string;
    isMember: boolean;
    membershipNumber: string;
    hasDoctorsNote: boolean;
    notificationMethod: 'email' | 'sms';
    contactInfo: string;
}

export const INITIAL_DATA: BookingData = {
    date: new Date().toISOString().split('T')[0],
    time: '',
    holes: 18,
    cartId: null,
    cartName: '',
    name: '',
    isMember: false,
    membershipNumber: '',
    hasDoctorsNote: false,
    notificationMethod: 'email',
    contactInfo: ''
};

interface Props {
    currentStep: number;
    setCurrentStep: (step: number | ((prev: number) => number)) => void;
    bookingData: BookingData;
    setBookingData: (data: BookingData | ((prev: BookingData) => BookingData)) => void;
}

function BookingStepper({ currentStep, setCurrentStep, bookingData, setBookingData }: Props) {
    const updateData = (data: Partial<BookingData>) => {
        setBookingData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step3Details data={bookingData} updateData={updateData} onNext={nextStep} onBack={() => { }} />;
            case 2:
                return <Step4Review data={bookingData} onBack={prevStep} />;
            default:
                return null;
        }
    };

    return (
        <div className="stepper-container">
            {/* Progress Bar */}
            <div className="progress-bar">
                {[1, 2].map(step => (
                    <div
                        key={step}
                        className={`progress-step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div className="step-content">
                {renderStep()}
            </div>
        </div>
    );
}

export default BookingStepper;
