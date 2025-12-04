# Final Implementation Questions - Clarification Needed

Based on your answers, I need to clarify a few remaining points:

## Question 1: Time Intervals - 10 Minutes?

You said "Time intervals: Should definitely be 10 minutes?" but didn't answer YES or NO.

### Context:
- **10-minute intervals** = 54 slots per day (10:00, 10:10, 10:20, etc.)
- Used when multiple groups can start at staggered times
- Each 18-hole booking blocks 24 consecutive slots (4 hours)
- Each 9-hole booking blocks 12 consecutive slots (2 hours)

### Alternative:
- **Hourly slots** = 11 slots per day (10:00, 11:00, 12:00, etc.) - CURRENT
- Used when only one group can start at each hour
- Each 18-hole booking blocks 4 slots
- Each 9-hole booking blocks 2 slots

**My recommendation:** 10-minute intervals is better for golf (allows more flexibility)

**Question:** Do you want 10-minute intervals or keep hourly? **YES or NO?**

---

## Question 2: Number of Players Field

You said "Form field: Should user enter 'how many players'? only one or 2"

I think you mean: Players can book for 1 or 2 groups?
- 1 group = 4 players
- 2 groups = 8 players

### Current Understanding:
- Players have a `numPlayers` stat (how many usually play together)
- On booking form: Should they specify if booking for 1 or 2 groups?
- One cart can only have one booking at a time
- If booking for 2 groups, they'd need 2 carts

**Question:** Should booking form let them select:
- [ ] Option A: Always 1 group (4 players) - fixed
- [ ] Option B: Choose 1 or 2 groups (4 or 8 players) - flexible, but might need 2 carts
- [ ] Option C: Flexible player count (1-8 players) - no groups

**Which option?**

---

## Question 3: 4-Ball Rule - Not Applicable?

You said "4-ball rule: Is this a hard requirement? (Or flexible?) **Not applicable in this scenario**"

### Understanding:
- So players don't always come in groups of 4
- Could be 1-2-3 players sometimes
- Time intervals should still be 10 minutes (staggered starts)

**Confirmed:** Don't enforce "must be exactly 4" - allow 1-8 players?

---

## Question 4: Pricing Clarification

You said "Pricing: Does price change based on number of players? **No pricing i pr. chart pr 9 hole or 18 hole rund**"

### I understand:
- Price = same regardless of how many players
- Only depends on holes: 18 holes = 450kr, 9 holes = 250kr
- 1 player for 18 holes = 450kr
- 4 players for 18 holes = 450kr (same)
- 8 players for 18 holes = 450kr (same - they'd just book 2 carts)

**Confirmed?** YES

---

## Summary So Far (CONFIRMED)

✅ Track repeat customers: **YES**
✅ Time intervals: **??? (10-min or hourly?)**
✅ Player field: **1 or 2 groups option?**
✅ Pricing by holes only: **YES (not by players)**
✅ Cancellations: **YES (player can cancel)**

---

## Implementation Plan (Once Clarified)

Once you answer the 3 questions above, I will:

1. **Create all 3 new files:**
   - `PlayerIdInput.tsx`
   - `BookingHistory.tsx`
   - `services/firestore.ts`

2. **Update 3 existing files:**
   - `BookingForm.tsx` (add player fields, cancellation, history)
   - `AvailabilityGrid.tsx` (10-min or hourly slots)
   - `UserApp.tsx` (new step 0 for player ID)

3. **Create Firestore collections:**
   - `players` (new)
   - Update `rentals` schema

4. **Test and deploy**

---

**Please answer these 3 clarification questions and I'll implement immediately! 🚀**
