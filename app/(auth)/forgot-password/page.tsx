export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="card-ctp w-full max-w-md border-[var(--border-bright)] p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
          Reset password
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Password reset flow coming soon. Contact support for now.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-sm text-[var(--green)] hover:underline"
        >
          Back to login
        </a>
      </div>
    </main>
  );
}
