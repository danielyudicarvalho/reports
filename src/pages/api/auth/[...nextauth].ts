import { query as q } from 'faunadb';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { fauna } from '../../../services/fauna';
import { PrismaClient } from '@prisma/client'

export default NextAuth({
  providers: [
    Providers.Facebook({ 
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
    })
  ],
  jwt:{
    encryption: true
  },
  callbacks: {
    async jwt(token, account) {
      if (account?.accessToken) {

        token.accessToken = account.accessToken;
      }

      const prismic = new PrismaClient()

      prismic.$connect()

      const user = await prismic.user.findFirst({
        where:{name: token.name}
      })

      if(!user){
        await prismic.user.create({
          data:{
            name: token.name,
            email: token.email
          }
        })
      }

      const allUsers = await prismic.user.findMany()
    
      console.log(allUsers)
     
      
    },
    redirect: async (url, _baseUrl) => {
      if (url === '/profile') {
        return Promise.resolve('/');
      }
      return Promise.resolve('/');
    },
  },
  
  
})