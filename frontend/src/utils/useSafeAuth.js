import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

export const useSafeAuth = () => {
  try {
    const auth = useAuth();
    return auth;
  } catch (err) {
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      signOut: async () => {},
      getToken: async () => null,
      has: () => false,
    };
  }
};

export const useSafeUser = () => {
  try {
    const user = useUser();
    return user;
  } catch (err) {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }
};

export const useSafeClerk = () => {
  try {
    const clerk = useClerk();
    return clerk;
  } catch (err) {
    return {
      loaded: true,
      user: null,
      session: null,
      signOut: async () => {},
      openSignIn: () => {},
      openSignUp: () => {},
    };
  }
};
