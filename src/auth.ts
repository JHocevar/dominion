import { SvelteKitAuth } from "@auth/sveltekit"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private"
import Google from "@auth/core/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "$lib/server/mongodb"

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id to the session
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    }
  }
})