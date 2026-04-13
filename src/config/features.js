// Feature flags for Dharma
//
// Toggle these to enable/disable features that require additional infrastructure.
// Edit and rebuild — these are NOT runtime-configurable.

export const FEATURES = {
  // Cloud Functions for payment verification.
  // Required for: claim_codes redemption, automated premium grant on payment verify.
  // When false: admin manually edits users/{uid}.premium OR sets payments.verified=true
  //            (client picks it up via payments scan on next sync).
  // To enable: deploy `firebase deploy --only functions` (requires Blaze plan).
  CLOUD_FUNCTIONS_ENABLED: false,

  // Anonymous claim code redemption UI in PremiumScreen.
  // Only useful when CLOUD_FUNCTIONS_ENABLED is true.
  CLAIM_CODES_UI: false,
};
