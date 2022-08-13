import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { getRandomArbitrary } from '../helpers/get-random-number'
const prisma = new PrismaClient()

faker.setLocale('id_ID')
const TOTAL_SEED_PER_TABLE = 50
async function main() {
  let userIds = []
  // user
  for (let i = 0; i < TOTAL_SEED_PER_TABLE; i++) {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const data = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email(firstName, lastName, 'example.com').toLowerCase(),
        password: await bcrypt.hash('qweqweqwe', 10),
        date_of_birth: faker.date.birthdate(),
        phone: faker.phone.number(),
        username: faker.internet.userName(firstName, lastName).toLowerCase(),
        picture: faker.image.animals(640, 480, true),
      },
    })
    console.log(333301, data)
    userIds.push(data.id)
  }

  // tweet
  let tweets = []
  for (let i = 0; i < TOTAL_SEED_PER_TABLE; i++) {
    const user_id = userIds[getRandomArbitrary(0, userIds.length - 1)]
    const data = await prisma.tweet.create({
      data: {
        content: faker.lorem.sentence(),
        user_id,
      },
    })
    console.log(333302, data)
    tweets.push(data.id)
  }

  // unit
  for (let i = 0; i < TOTAL_SEED_PER_TABLE; i++) {
    let follower_id = userIds[getRandomArbitrary(0, userIds.length - 1)]
    let following_id = userIds[getRandomArbitrary(0, userIds.length - 1)]

    while (follower_id === following_id) {
      follower_id = userIds[getRandomArbitrary(0, userIds.length - 1)]
      following_id = userIds[getRandomArbitrary(0, userIds.length - 1)]
    }
    const data = await prisma.follow.create({
      data: {
        follower_id,
        following_id,
      },
    })
    console.log(333303, data)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
