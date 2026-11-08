// Domain: the signed-in user as the rest of the app sees it.
export type User = {
  id: string; // Cognito "sub": stable and unique, unlike email
  email: string;
};
