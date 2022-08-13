import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import jwt from 'jsonwebtoken'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { buildSchema, createMethodDecorator } from 'type-graphql'
import { CustomUserResolver } from './resolver/auth'
import {
  TweetCrudResolver,
  TweetRelationsResolver,
  FollowCrudResolver,
  FollowRelationsResolver,
  UserRelationsResolver,
  FindManyUserResolver,
  GroupByUserResolver,
  AggregateUserResolver,
  FindFirstUserResolver,
  FindUniqueUserResolver,
  applyResolversEnhanceMap,
  ResolversEnhanceMap,
} from '@generated/type-graphql'

export const prisma = new PrismaClient()

function ValidateArgs(schema?: any) {
  return createMethodDecorator(async ({ root, args, context, info }: any, next) => {
    // here place your middleware code that uses custom decorator arguments

    // e.g. validation logic based on schema using joi
    // await joiValidate(schema, args)
    try {
      console.log(33333123, { root, args, context, info }, context?.req?.headers)
      const { authorization } = context?.req?.headers || {}
      const [stringBearer, accessToken] = (authorization || '')?.split(' ')
      console.log(333334, { stringBearer, accessToken })
      if (stringBearer !== 'Bearer') throw 'invalid bearer token'
      const parseData = jwt.verify(accessToken as string, 'secret') as {
        data: { role: string }
      }
      if (!parseData) throw 'invalid bearer token'
      return next()
    } catch (error) {
      throw error
    }
  })
}

const resolversEnhanceMap: ResolversEnhanceMap = {
  User: {
    _all: [ValidateArgs()],
  },
  Tweet: {
    _all: [ValidateArgs()],
  },
  Follow: {
    _all: [ValidateArgs()],
  },
}

applyResolversEnhanceMap(resolversEnhanceMap)

const startServer = async () => {
  const schema = await buildSchema({
    resolvers: [
      TweetCrudResolver,
      TweetRelationsResolver,
      FollowCrudResolver,
      FollowRelationsResolver,
      UserRelationsResolver,
      FindManyUserResolver,
      GroupByUserResolver,
      AggregateUserResolver,
      FindFirstUserResolver,
      FindUniqueUserResolver,
      CustomUserResolver,
    ],
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
