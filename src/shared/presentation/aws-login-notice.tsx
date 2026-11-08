// Local dev only: shown when the `aws login` session has expired, instead of
// a generic database error.
export function AwsLoginNotice() {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
    >
      <p className="font-medium">Can&apos;t reach the database: AWS session expired</p>
      <p className="mt-1">
        Run <code className="font-mono">aws login --region us-east-1</code> in your
        terminal, then reload this page. No restart needed.
      </p>
    </div>
  );
}
