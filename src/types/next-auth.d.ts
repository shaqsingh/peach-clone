import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    username: string | null;
    displayName: string | null;
    role: string;
    lastActive: Date;
    showActivity: boolean;
    image?: string | null;
    themePrimary?: string | null;
    themeSecondary?: string | null;
    bgImageUrl?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    role: string;
  }
}
