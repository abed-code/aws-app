// Public API of the auth feature. Other features import from "@/features/auth"
// only, never from its internal folders.
export type { User } from "./domain/user";
export { getCurrentUser } from "./auth.module";
export { beginSignIn, completeSignIn, signOut } from "./infrastructure/sign-in-flow";
export { SignInPrompt } from "./presentation/sign-in-prompt";
export { UserMenu } from "./presentation/user-menu";
