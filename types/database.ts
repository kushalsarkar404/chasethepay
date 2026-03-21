export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InvoiceStatus = "open" | "paid" | "void";
export type ChaseType = "email";
export type ChaseStatus = "sent" | "delivered" | "failed" | "bounced";
export type AITone = "friendly" | "professional" | "firm";
export type ChaseFrequency = "1min" | "1day" | "3days" | "weekly";
export type Plan = "free" | "pro" | "test";

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          stripe_account_id: string;
          integration_type: "stripe";
          connected_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_account_id: string;
          integration_type?: "stripe";
          connected_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          account_id: string;
          stripe_invoice_id: string;
          status: InvoiceStatus;
          due_date: string;
          amount_due: number;
          amount_remaining: number;
          customer_name: string | null;
          customer_email: string | null;
          chase_count: number;
          last_chased_at: string | null;
          recovered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          stripe_invoice_id: string;
          status: InvoiceStatus;
          due_date: string;
          amount_due: number;
          amount_remaining: number;
          customer_name?: string | null;
          customer_email?: string | null;
          chase_count?: number;
          last_chased_at?: string | null;
          recovered_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      chases: {
        Row: {
          id: string;
          invoice_id: string;
          type: ChaseType;
          message: string;
          sent_at: string;
          status: ChaseStatus;
          provider_message_id: string | null;
          reply: string | null;
          opened_at: string | null;
          clicked_at: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          type: ChaseType;
          message: string;
          sent_at?: string;
          status: ChaseStatus;
          provider_message_id?: string | null;
          reply?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chases"]["Insert"]>;
      };
      user_marketing: {
        Row: {
          user_id: string;
          first_signed_in_at: string | null;
          last_signed_in_at: string | null;
          is_paid: boolean;
          viewed_billing_at: string | null;
          chases_used_count: number;
          stripe_connected: boolean;
          survey_sent_at: string | null;
          total_recovered_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          first_signed_in_at?: string | null;
          last_signed_in_at?: string | null;
          is_paid?: boolean;
          viewed_billing_at?: string | null;
          chases_used_count?: number;
          stripe_connected?: boolean;
          survey_sent_at?: string | null;
          total_recovered_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_marketing"]["Insert"]>;
      };
      settings: {
        Row: {
          user_id: string;
          sender_name: string;
          ai_tone: AITone;
          chase_frequency: ChaseFrequency;
          max_chases: number;
          from_email: string | null;
          reply_to_email: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          sender_name?: string;
          ai_tone?: AITone;
          chase_frequency?: ChaseFrequency;
          max_chases?: number;
          from_email?: string | null;
          reply_to_email?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
}

export type UserMarketing = Database["public"]["Tables"]["user_marketing"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Chase = Database["public"]["Tables"]["chases"]["Row"];
export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
