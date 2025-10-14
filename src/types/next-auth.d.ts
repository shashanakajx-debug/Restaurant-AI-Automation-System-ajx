import 'next-auth';

declare module 'next-auth' {
  interface User {
    /** Custom id persisted in the user object */
    id?: string;
    role?: 'admin' | 'staff' | 'customer';
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      role?: 'admin' | 'staff' | 'customer';
    };
  }
}
