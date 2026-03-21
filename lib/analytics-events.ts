/**
 * Analytics event catalog – best-practice naming (Object_Action) and typed properties.
 * Use these constants for consistency, Mixpanel dashboards, and cohort analysis.
 *
 * Data science metrics covered:
 * - Acquisition funnel (signup → onboarding → activation)
 * - Activation (Stripe connect, first invoice, first chase)
 * - Engagement (page views, actions, session depth)
 * - Monetization (upgrade funnel, revenue, LTV)
 * - Retention (subscription lifecycle, churn)
 */
export const AnalyticsEvents = {
  // ─── Acquisition & Onboarding ─────────────────────────────────────────────
  User_SignupStarted: "User_SignupStarted",
  User_AccountCreated: "User_AccountCreated",
  User_LoginSuccess: "User_LoginSuccess",
  User_LoginFailed: "User_LoginFailed",
  User_Identified: "User_Identified",
  Onboarding_StepViewed: "Onboarding_StepViewed",
  Onboarding_Completed: "Onboarding_Completed",

  // ─── Activation (Stripe Connect & First Use) ──────────────────────────────
  Stripe_ConnectClicked: "Stripe_ConnectClicked",
  Stripe_ConnectSuccess: "Stripe_ConnectSuccess",
  Stripe_ConnectFailed: "Stripe_ConnectFailed",
  Stripe_Disconnected: "Stripe_Disconnected",
  Invoices_ScanStarted: "Invoices_ScanStarted",
  Invoices_ScanCompleted: "Invoices_ScanCompleted",
  Invoices_ScanFailed: "Invoices_ScanFailed",

  // ─── Core Product (Chases) ────────────────────────────────────────────────
  Chase_Sent: "Chase_Sent",
  Chase_Sent_Auto: "Chase_Sent_Auto",
  Chase_Failed: "Chase_Failed",
  Chase_EmailOpened: "Chase_EmailOpened",
  Chase_EmailClicked: "Chase_EmailClicked",
  Chase_FreeLimitReached: "Chase_FreeLimitReached",
  SentEmails_PageViewed: "SentEmails_PageViewed",
  SentEmails_Deleted: "SentEmails_Deleted",
  SentEmails_DetailOpened: "SentEmails_DetailOpened",

  // ─── Monetization ─────────────────────────────────────────────────────────
  Upgrade_ModalShown: "Upgrade_ModalShown",
  Upgrade_ButtonClicked: "Upgrade_ButtonClicked",
  Upgrade_MaybeLaterClicked: "Upgrade_MaybeLaterClicked",
  FreeChasesBanner_Viewed: "FreeChasesBanner_Viewed",
  FreeChasesBanner_UpgradeClicked: "FreeChasesBanner_UpgradeClicked",
  Billing_CheckoutStarted: "Billing_CheckoutStarted",
  Billing_CheckoutCompleted: "Billing_CheckoutCompleted",
  Billing_SubscriptionCancelled: "Billing_SubscriptionCancelled",
  Billing_SubscriptionUpdated: "Billing_SubscriptionUpdated",
  Billing_SubscriptionDeleted: "Billing_SubscriptionDeleted",
  Revenue_Recovered: "Revenue_Recovered",

  // ─── Engagement ───────────────────────────────────────────────────────────
  Dashboard_Viewed: "Dashboard_Viewed",
  Dashboard_Refreshed: "Dashboard_Refreshed",
  Dashboard_TabSwitched: "Dashboard_TabSwitched",
  Settings_Viewed: "Settings_Viewed",
  Settings_Updated: "Settings_Updated",
  Settings_BillingViewed: "Settings_BillingViewed",

  // ─── Retention & Session ──────────────────────────────────────────────────
  Page_Viewed: "Page_Viewed",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
