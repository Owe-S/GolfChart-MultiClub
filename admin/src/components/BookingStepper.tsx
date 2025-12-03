import '../ski-gk-theme.css';
import ProgressSteps from './ProgressSteps';

// Step Components
import Step1Date from './steps/Step1Date';
import Step2Cart from './steps/Step2Cart';
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

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const goToStep = (step: number) => setCurrentStep(step);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Date data={bookingData} updateData={updateData} onNext={nextStep} />;
            case 2:
                return <Step2Cart data={bookingData} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
            case 3:
                return <Step3Details data={bookingData} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
            case 4:
                return <Step4Review data={bookingData} onBack={prevStep} onEdit={goToStep} />;
            default:
                return null;
        }
    };

    return (
        <div className="stepper-container">
            {/* Enhanced Progress Steps */}
            <ProgressSteps 
                currentStep={currentStep} 
                totalSteps={4}
                onStepClick={goToStep}
            />

            {/* Step Content */}
            <div className="step-content">
                {renderStep()}
            </div>
        </div>
    );
}

export default BookingStepper;
