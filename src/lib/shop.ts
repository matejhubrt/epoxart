/**
 * Online payment (card, Apple Pay, Google Pay, bank buttons) goes through a payment gateway that
 * the shop does not have yet. While this is false, every place that mentions it is hidden:
 *   - obchodní podmínky (section 3.2) and ochrana osobních údajů (recipients),
 *   - the "Doprava a platba" page,
 *   - the payment choice in the checkout.
 *
 * REMEMBER: when the gateway (ComGate) works, set this to true so the texts show up again.
 */
export const PAYMENT_GATEWAY_LIVE = false;
