import { Request } from 'express'
import { prisma } from '..'

export type Context = {
  prisma: typeof prisma
  req: Request
}
