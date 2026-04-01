import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { createTransport } from "nodemailer";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.resend.com",
        port: Number(process.env.EMAIL_SERVER_PORT || 465),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "resend",
          pass: process.env.EMAIL_SERVER_PASSWORD || "placeholder",
        },
      },
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      async sendVerificationRequest(params) {
        const { identifier, url, provider } = params;
        const { host } = new URL(url);
        
        // MOCK EMAIL IF NO REAL API KEY IS PRESENT
        const server = provider.server as any;
        if (server?.auth?.pass === "placeholder" || !server?.auth?.pass) {
          console.log(`\n\n=========================================`);
          console.log(`📨 MOCK EMAIL SENT TO: ${identifier}`);
          console.log(`🔗 CLICK THIS MAGIC LINK TO LOGIN:\n   ${url}`);
          console.log(`=========================================\n\n`);
          return;
        }

        // Send Real Email
        const transport = createTransport(provider.server);
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `<p>Sign in to your space:</p><p><a href="${url}">Click here to sign in</a></p>`
        });
        
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // 1. Allow if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUser) return true;

      // 2. Allow if this is the very first user (they will be the admin)
      const userCount = await prisma.user.count();
      if (userCount === 0) return true;

      // 3. Allow if the email is on the invite list
      const invite = await prisma.invite.findUnique({
        where: { email: user.email },
      });
      
      if (invite) return true;

      // Otherwise, block access
      return "/login?error=InviteOnly";
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        (session.user as any).username = (user as any).username;
        (session.user as any).role = (user as any).role;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      // Determine if this was the first user
      const userCount = await prisma.user.count();
      // If userCount is 1, it means this was the first user just created
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }

      // Cleanup invite if it exists
      if (user.email) {
        await prisma.invite.deleteMany({
          where: { email: user.email },
        });
      }
    }
  }
};
