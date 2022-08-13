import { UserCreateInput, User } from '@generated/type-graphql'
import { Arg, Ctx, Field, InputType, Mutation, Resolver, ObjectType } from 'type-graphql'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Context } from './context'
import { generateToken } from '../helpers/genetare-token'

@InputType()
class GetAccessTokenInput implements Partial<UserCreateInput> {
  @Field()
  email?: string

  @Field()
  password?: string
}

@InputType()
class GetNewAccessTokenInput {
  @Field()
  accessToken?: string

  @Field()
  refreshToken?: string
}

@InputType()
class RegisterInput implements Partial<UserCreateInput> {
  @Field({ nullable: true })
  id?: string
  @Field({ nullable: true })
  createdAt?: Date
  @Field({ nullable: true })
  updatedAt?: Date
  @Field()
  role?: 'SUPERADMIN' | 'ADMIN'
  @Field()
  name?: string
  @Field()
  email?: string
  @Field()
  password?: string
}

@ObjectType()
class RegisterReturnType extends User {
  @Field()
  accessToken?: string
  @Field()
  refreshToken?: string
}
@Resolver()
export class CustomUserResolver {
  @Mutation(() => RegisterReturnType)
  async register(
    @Arg('data') data: UserCreateInput,
    @Ctx()
    ctx: Context
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password as string, 10)
    // @ts-ignore
    const result = await ctx.prisma.user.create({ data: { ...data, password: hashedPassword } })
    return { ...result, ...generateToken(result) }
  }

  @Mutation(() => RegisterReturnType)
  async getAccessToken(
    @Arg('data') data: GetAccessTokenInput,
    @Ctx()
    ctx: Context
  ): Promise<any> {
    const result = await ctx.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!result) throw 'User not found!'
    const isPasswordMatch = await bcrypt.compare(data.password as string, result.password)
    if (!isPasswordMatch) throw 'Email / password not correct!'
    return { ...result, ...generateToken(result) }
  }

  @Mutation(() => RegisterReturnType)
  async getNewAccessToken(
    @Arg('data') data: GetNewAccessTokenInput,
    @Ctx()
    ctx: Context
  ): Promise<any> {
    // when accessToken expires & expires 7 days
    // cannot generate new token

    const [bearerRefreshToken, refreshToken] = data.refreshToken?.split(' ') || []
    console.log(33334, bearerRefreshToken, refreshToken)
    if (bearerRefreshToken !== 'Bearer') throw 'invalid bearer token'
    const parseData = jwt.verify(refreshToken as string, 'secret') as {
      data: { id: number }
    }
    const result = await ctx.prisma.user.findUnique({
      where: {
        id: parseData.data.id,
      },
    })
    if (!result) throw 'User not found!'
    return { ...result, ...generateToken(result) }
  }
}
