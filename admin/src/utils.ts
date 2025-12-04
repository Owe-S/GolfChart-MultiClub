import { PRICES, DOCTOR_NOTE_DISCOUNT, PLAY_DURATION, CHARGE_DURATION } from './types';
import type { Rental } from './types';

// Utility functions ported from original code

export function formatDateTime(isoString: string | null): string {
    if (!isoString) return 'Pågående';
    return new Date(isoString).toLocaleString('nb-NO', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

export function calculatePrice(
    isMember: boolean,
    hasDoctorsNote: boolean,
    holes: 9 | 18
): number {
    const basePrice = isMember ? PRICES.member[holes] : PRICES.nonMember[holes];
    const discount = hasDoctorsNote ? DOCTOR_NOTE_DISCOUNT : 0;
    return Math.max(0, basePrice - discount);
}

export function getRentalBlockEnd(rental: Rental): Date {
    const startTime = rental.startTime.toDate();
    const totalDuration = PLAY_DURATION[rental.holes] + CHARGE_DURATION[rental.holes];
    return new Date(startTime.getTime() + totalDuration * 60 * 1000);
}
