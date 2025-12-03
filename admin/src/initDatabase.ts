// Script to initialize Firestore with cart data
// Run this once to set up the database
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CartStatus, TOTAL_CARTS, CART_NAMES } from './types';

export async function initializeDatabase() {
    console.log('Initializing Firestore database with 5 named carts...');

    // Create 5 carts with names
    for (let i = 1; i <= TOTAL_CARTS; i++) {
        const cartRef = doc(db, 'carts', i.toString());
        await setDoc(cartRef, {
            name: CART_NAMES[i - 1],
            status: CartStatus.Available,
            currentRentalId: null
        });
        console.log(`Created cart ${i}: ${CART_NAMES[i - 1]}`);
    }

    console.log('Database initialization complete!');
}
