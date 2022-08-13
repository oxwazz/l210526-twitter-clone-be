import jwt from 'jsonwebtoken'
import { User } from '@generated/type-graphql'

export function generateToken(data: User) {
  return {
    accessToken:
      'Bearer ' +
      jwt.sign(
        {
          data: {
            id: data.id,
            name: data.name,
            email: data.email,
          },
        },
        'secret',
        { expiresIn: '1d' }
      ),
    refreshToken: 'Bearer ' + jwt.sign({ data: { id: data.id } }, 'secret', { expiresIn: '1y' }),
  }
}
