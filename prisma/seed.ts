import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { getRandomArbitrary } from '../helpers/get-random-number'
const prisma = new PrismaClient()

const randomPhoneNumberPrefix = [
  '+62811#######', // ( Halo 10, 11 digit )
  '+62812########', // ( Halo, Simpati 11, 12 digit )
  '+62813########', // ( Halo, Simpati 12 digit )
  '+62821########', // ( Simpati 12 digit )
  '+62822########', // ( Simpati, Kartu Facebook )
  '+62823########', // ( AS 12 digit )
  '+62851########', // ( AS 12 digit )
  '+62852########', // ( AS 12 digit )
  '+62853########', // ( AS 12 digit )
]

const TOTAL_SEED_PER_TABLE = 10
async function main() {
  let userIds = []
  // user
  for (let i = 0; i < TOTAL_SEED_PER_TABLE; i++) {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const phone = randomPhoneNumberPrefix[getRandomArbitrary(0, randomPhoneNumberPrefix.length - 1)]
    const data = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email(firstName, lastName, 'example.com').toLowerCase(),
        password: await bcrypt.hash('qweqweqwe', 10),
        date_of_birth: faker.date.birthdate(),
        phone: faker.phone.number(phone),
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
  for (let i = 0; i < TOTAL_SEED_PER_TABLE * 2; i++) {
    let follower_id = userIds[getRandomArbitrary(0, userIds.length - 1)]
    let user_id = userIds[getRandomArbitrary(0, userIds.length - 1)]

    if (follower_id !== user_id) {
      const data = await prisma.follow.upsert({
        where: {
          user_id_follower_id: {
            user_id,
            follower_id,
          },
        },
        create: {
          user_id,
          follower_id,
        },
        update: {
          user_id,
          follower_id,
        },
      })
      console.log(333303, data)
    }
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
