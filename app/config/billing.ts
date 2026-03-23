/**
 * Global Billing Toggle for the Frontend.
 * Must match firebase-functions/src/index.ts.
 */
export const BILLING_ENABLED = false;

export const INACTIVE_BILLING_STATUSES = ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired"];
