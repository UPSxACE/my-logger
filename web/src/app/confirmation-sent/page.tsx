export default function ConfirmationSentPage() {
  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-mantine-gray-1 p-1">
      <section className="relative w-full max-w-[420px] rounded-md border border-solid border-stone-300 bg-white p-8 pt-6">
        <h1 className="m-0 text-center text-xl">Confirm Email</h1>
        <p className="m-0 mt-2 text-center">
          A confirmation link has been sent to your email. Please click the link
          in your email to activate your account and finish the registration
          process.
        </p>
      </section>
    </main>
  );
}
