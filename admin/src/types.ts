// Shared types and constants for the application

export const CartStatus = {
    Available: 'available',
    Rented: 'rented',
    OutOfOrder: 'out_of_order',
} as const;

export type CartStatus = typeof CartStatus[keyof typeof CartStatus];

export const PaymentMethod = {
    Vipps: 'Vipps',
    Card: 'Kort',
    Cash: 'Kontant',
    ClubCredit: 'Klubbkreditt',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export type NotificationMethod = 'email' | 'sms';

export interface GolfCart {
    id: number;
    name: string;  // e.g., "Blå 4", "Blå 5", "Grønn", "Hvit", "Svart"
    status: CartStatus;
    currentRentalId: string | null;
}

export interface Rental {
    id: string; // Firestore document ID
    cartId: number;
    renterName: string;
    isMember: boolean;
    membershipNumber?: string;
    hasDoctorsNote: boolean;
    holes: 9 | 18;
    price: number;
    paymentMethod: PaymentMethod | null;
    notes?: string;
    phone: string; // Phone number
    email?: string; // Email address
    startTime: import('firebase/firestore').Timestamp; // Firestore Timestamp
    endTime?: string | null; // ISO string
    notificationMethod: 'email' | 'sms';
    contactInfo: string;
    reminderSent: boolean;
    createdAt?: import('firebase/firestore').Timestamp; // Firestore Timestamp
}

export interface AppState {
    carts: GolfCart[];
    rentals: Rental[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// Configuration
export const TOTAL_CARTS = 5;
export const CART_NAMES = ['Blå 4', 'Blå 5', 'Grønn', 'Hvit', 'Svart'];
export const PRICES = {
    member: { 9: 200, 18: 350 },
    nonMember: { 9: 250, 18: 425 },
};
export const DOCTOR_NOTE_DISCOUNT = 50;
export const BOOKING_LEAD_DAYS = 7;
export const PLAY_DURATION = { 9: 135, 18: 270 }; // minutes
export const CHARGE_DURATION = { 9: 30, 18: 60 }; // minutes
export const REMINDER_WINDOW_HOURS = 24;

// Booking types used by BookingStepper
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
    notificationMethod: NotificationMethod;
    contactInfo: string;
    phone?: string;
    email?: string;
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
    contactInfo: '',
    phone: '',
    email: ''
};
