export function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800">
      <p className="mb-4 text-zinc-500">{message}</p>
      <a
        href="/auth/login"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Sign in
      </a>
    </div>
  );
}
