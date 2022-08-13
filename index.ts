import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { resolvers } from '@generated/type-graphql'
import { buildSchema } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import express from 'express'
const prisma = new PrismaClient()

const startServer = async () => {
  console.log(33344, resolvers)
  const schema = await buildSchema({
    resolvers,
    validate: false,
  })

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    schema, // from previous step
    context: ({ req }) => ({ prisma, req }),
    csrfPrevention: true,
    cache: 'bounded',
    introspection: true,
    /**
     * What's up with this embed: true option?
     * These are our recommended settings for using AS;
     * they aren't the defaults in AS3 for backwards-compatibility reasons but
     * will be the defaults in AS4. For production environments, use
     * ApolloServerPluginLandingPageProductionDefault instead.
     **/
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  })

  const app = express()

  await server.start()
  server.applyMiddleware({ app })

  // The `listen` method launches a web server.
  const PORT = process.env.PORT || 4000
  const IS_PROD = process.env.ENV === 'production'
  app.listen({ port: PORT }, () => {
    console.log(`🚀 [${IS_PROD ? 'PROD' : 'DEV'}] Server ready at port ${PORT}`)
    console.log(`   - http://localhost:${PORT}/graphql`)
  })
}

startServer()
