import { cn } from "@/app/_lib/utils";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider !== "google") return false;
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.idToken = account.id_token;
            }
            return token;
        },
        async session({ session, token}){
            session.user.accessToken = token.accessToken;
            session.user.idToken = token.idToken;
            return session;
        }
    }
};



const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
