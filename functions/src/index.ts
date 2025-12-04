import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS handler
const corsHandler = cors({ origin: true });

// Types
interface CreateRentalRequest {
    cartId: number;
    renterName: string;
    isMember: boolean;
    membershipNumber?: string;
    hasDoctorsNote: boolean;
    holes: 9 | 18;
    startTime: string; // ISO string
    notificationMethod: 'email' | 'sms';
    contactInfo: string;
    notes?: string;
    price: number;
}

/**
 * Creates a new rental transactionally.
 * Prevents double-booking of the same cart.
 */
export const createRental = https.onRequest({ region: 'europe-west3' }, (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const data = req.body as CreateRentalRequest;

        // Basic validation
        if (!data.cartId || !data.startTime || !data.renterName) {
            res.status(400).send({ error: 'Missing required fields' });
            return;
        }

        try {
            const result = await db.runTransaction(async (transaction) => {
                // 1. Calculate end time (approximate, for conflict checking)
                const startDate = new Date(data.startTime);
                const durationMinutes = data.holes === 18 ? 240 : 120; // 4h or 2h
                const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

                // 2. Check for conflicts for THIS specific cart
                // We query for any rental of this cart that overlaps with the requested time
                const rentalsRef = db.collection('rentals');
                const snapshot = await rentalsRef
                    .where('cartId', '==', data.cartId)
                    .where('startTime', '<', endDate.toISOString()) // Starts before this one ends
                    .get();

                // Filter results in memory for the other bound (ends after this one starts)
                // Firestore composite queries have limitations, so we do some filtering here
                const conflicts = snapshot.docs.filter(doc => {
                    const rental = doc.data();
                    const rentalEnd = rental.endTime ? new Date(rental.endTime) : new Date(new Date(rental.startTime).getTime() + (rental.holes === 18 ? 240 : 120) * 60000);
                    return rentalEnd > startDate;
                });

                if (conflicts.length > 0) {
                    throw new Error('Cart is already booked for this time slot.');
                }

                // 3. Create the rental
                const newRentalRef = rentalsRef.doc();
                const rentalData = {
                    ...data,
                    endTime: endDate.toISOString(),
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    paymentMethod: null, // Paid at shop
                    reminderSent: false
                };

                transaction.set(newRentalRef, rentalData);

                // 4. Update cart status (optional, for quick status check)
                // In a real system, status is derived from rentals, but we can keep a "currentStatus" field
                const cartRef = db.collection('carts').doc(String(data.cartId));
                transaction.update(cartRef, {
                    status: 'rented',
                    currentRentalId: newRentalRef.id
                });

                return { id: newRentalRef.id };
            });

            res.status(200).send({ success: true, rentalId: result.id });

        } catch (error: any) {
            console.error('Transaction failure:', error);
            res.status(409).send({ error: error.message || 'Booking failed' });
        }
    });
});

/**
 * Checks availability for a given date and time.
 * Returns a list of available cart IDs.
 */
export const checkAvailability = https.onRequest({ region: 'europe-west3' }, (req, res) => {
    corsHandler(req, res, async () => {
        const { date, time, holes } = req.query;

        if (!date || !time) {
            res.status(400).send({ error: 'Missing date or time' });
            return;
        }

        try {
            const startTime = new Date(`${date}T${time}`);
            const durationMinutes = Number(holes) === 18 ? 240 : 120;
            const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

            // Get all carts
            const cartsSnapshot = await db.collection('carts').get();
            const allCartIds = cartsSnapshot.docs.map(doc => Number(doc.id));

            // Get all rentals for the day (broad query)
            // Optimization: Query rentals that start on the same day
            const startOfDay = new Date(date as string);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date as string);
            endOfDay.setHours(23, 59, 59, 999);

            const rentalsSnapshot = await db.collection('rentals')
                .where('startTime', '>=', startOfDay.toISOString())
                .where('startTime', '<=', endOfDay.toISOString())
                .get();

            // Find booked cart IDs
            const bookedCartIds = new Set<number>();

            rentalsSnapshot.docs.forEach(doc => {
                const rental = doc.data();
                const rentalStart = new Date(rental.startTime);
                const rentalEnd = rental.endTime ? new Date(rental.endTime) : new Date(rentalStart.getTime() + (rental.holes === 18 ? 240 : 120) * 60000);

                // Check overlap
                if (startTime < rentalEnd && endTime > rentalStart) {
                    bookedCartIds.add(rental.cartId);
                }
            });

            // Determine available carts
            const availableCartIds = allCartIds.filter(id => !bookedCartIds.has(id));

            res.status(200).send({ availableCartIds });

        } catch (error) {
            console.error('Availability check error:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    });
});
