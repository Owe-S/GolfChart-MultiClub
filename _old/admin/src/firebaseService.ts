import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { GolfCart, Rental, CartStatus } from './types';

// Collection references
const CARTS_COLLECTION = 'carts';
const RENTALS_COLLECTION = 'rentals';

/**
 * Fetches all golf carts from Firestore
 */
export const getCarts = async (): Promise<GolfCart[]> => {
    const cartsCol = collection(db, CARTS_COLLECTION);
    const cartSnapshot = await getDocs(cartsCol);
    const cartsList = cartSnapshot.docs.map(doc => ({
        id: Number(doc.id),
        ...doc.data()
    } as GolfCart));
    return cartsList.sort((a, b) => a.id - b.id);
};

/**
 * Checks availability for a specific date and time via HTTP Cloud Function
 */
export const checkAvailability = async (date: string, time: string, holes: 9 | 18): Promise<{ available: number, availableCartIds: number[] }> => {
    try {
        const region = (import.meta as any).env?.VITE_FUNCTIONS_REGION || 'europe-west1';
        const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'golfbilkontroll-skigk';
        const overrideBase = (import.meta as any).env?.VITE_FUNCTIONS_BASE_URL as string | undefined;
        const baseUrl = overrideBase || `https://${region}-${projectId}.cloudfunctions.net`;
        const url = `${baseUrl}/checkAvailability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&holes=${holes}`;

        const resp = await fetch(url, { method: 'GET' });
        if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`checkAvailability failed: ${resp.status} ${errText}`);
        }
        const data = await resp.json() as { availableCartIds: number[] };
        return {
            available: data.availableCartIds.length,
            availableCartIds: data.availableCartIds
        };
    } catch (error) {
        console.error("Error checking availability:", error);
        throw error;
    }
};

/**
 * Creates a new rental booking via HTTP Cloud Function (Transactional)
 */
export const createRental = async (rentalData: Omit<Rental, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const region = (import.meta as any).env?.VITE_FUNCTIONS_REGION || 'europe-west1';
        const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'golfbilkontroll-skigk';
        const overrideBase = (import.meta as any).env?.VITE_FUNCTIONS_BASE_URL as string | undefined;
        const baseUrl = overrideBase || `https://${region}-${projectId}.cloudfunctions.net`;
        const url = `${baseUrl}/createRental`;

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('createRental failed:', resp.status, errText);
            throw new Error(`createRental failed: ${resp.status} ${errText}`);
        }
        const data = await resp.json() as { success: boolean, rentalId: string };
        return data.rentalId;
    } catch (error) {
        console.error("Error creating rental:", error);
        throw error;
    }
};

/**
 * Fetches rentals with optional filtering
 */
export const getRentals = async (filter?: { date?: string, status?: 'active' | 'upcoming' | 'completed' }): Promise<Rental[]> => {
    let q = query(collection(db, RENTALS_COLLECTION), orderBy('startTime', 'asc'));

    if (filter?.date) {
        const startOfDay = new Date(filter.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filter.date);
        endOfDay.setHours(23, 59, 59, 999);

        q = query(
            collection(db, RENTALS_COLLECTION),
            where('startTime', '>=', startOfDay.toISOString()),
            where('startTime', '<=', endOfDay.toISOString()),
            orderBy('startTime', 'asc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Partial<Rental> as Rental));
};

/**
 * Updates the status of a golf cart
 */
export const updateCartStatus = async (cartId: number, status: CartStatus, currentRentalId?: string | null) => {
    const cartRef = doc(db, CARTS_COLLECTION, String(cartId));
    await updateDoc(cartRef, {
        status,
        currentRentalId: currentRentalId ?? null
    });
};

/**
 * Ends a rental and makes the cart available again
 */
export const endRental = async (rentalId: string, cartId: number) => {
    const rentalRef = doc(db, RENTALS_COLLECTION, rentalId);
    const cartRef = doc(db, CARTS_COLLECTION, String(cartId));

    await updateDoc(rentalRef, {
        endTime: new Date().toISOString(),
        status: 'completed'
    });

    await updateDoc(cartRef, {
        status: 'available',
        currentRentalId: null
    });
};
