import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
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
 * Checks availability for a specific date and time using Cloud Function
 */
export const checkAvailability = async (date: string, time: string, holes: 9 | 18): Promise<{ available: number, availableCartIds: number[] }> => {
    try {
        const checkAvailabilityFn = httpsCallable(functions, 'checkAvailability');
        const result = await checkAvailabilityFn({ date, time, holes });
        const data = result.data as { availableCartIds: number[] };

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
 * Creates a new rental booking using Cloud Function (Transactional)
 */
export const createRental = async (rentalData: Omit<Rental, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const createRentalFn = httpsCallable(functions, 'createRental');
        const result = await createRentalFn(rentalData);
        const data = result.data as { success: boolean, rentalId: string };
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
