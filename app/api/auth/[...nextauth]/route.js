import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
          name: user.name,
          email: user.email,
          image: user.image,
        });
        return true;
      } catch (err) {
        console.error("SignIn error:", err?.response?.data || err);
        return false;
      }
    },
    async session({ session }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
