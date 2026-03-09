/**
 * Mixpanel event catalog – best-practice naming (Object_Action) and typed properties.
 * Use these constants to ensure consistency and enable autocomplete.
 */
export const AnalyticsEvents = {
  // ─── Acquisition & Onboarding ─────────────────────────────────────────────
  User_SignupStarted: "User_SignupStarted",
  User_AccountCreated: "User_AccountCreated",
  User_LoginSuccess: "User_LoginSuccess",
  User_LoginFailed: "User_LoginFailed",
  User_Identified: "User_Identified",

  // ─── Activation (Stripe Connect) ──────────────────────────────────────────
  Stripe_ConnectClicked: "Stripe_ConnectClicked",
  Stripe_ConnectSuccess: "Stripe_ConnectSuccess",
  Stripe_ConnectFailed: "Stripe_ConnectFailed",
  Stripe_Disconnected: "Stripe_Disconnected",

  // ─── Core Product (Chases) ────────────────────────────────────────────────
  Chase_Sent: "Chase_Sent",
  Chase_Failed: "Chase_Failed",
  Chase_FreeLimitReached: "Chase_FreeLimitReached",

  // ─── Monetization ─────────────────────────────────────────────────────────
  Upgrade_ModalShown: "Upgrade_ModalShown",
  Upgrade_ButtonClicked: "Upgrade_ButtonClicked",
  Upgrade_MaybeLaterClicked: "Upgrade_MaybeLaterClicked",
  Billing_CheckoutStarted: "Billing_CheckoutStarted",

  // ─── Engagement ───────────────────────────────────────────────────────────
  Dashboard_Refreshed: "Dashboard_Refreshed",
  Dashboard_TabSwitched: "Dashboard_TabSwitched",
  Settings_Updated: "Settings_Updated",
  Settings_BillingViewed: "Settings_BillingViewed",

  // ─── Retention & Session ──────────────────────────────────────────────────
  Page_Viewed: "Page_Viewed",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
