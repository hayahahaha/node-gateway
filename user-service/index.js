const express = require('express')
const session = require('express-session')
const rateLimit = require('express-rate-limit')
const winston = require('winston')
const expressWinston = require('express-winston')
const responseTime = require('response-time')
const cors = require('cors')
const helmet = require('helmet')
const { faker } = require('@faker-js/faker')

const app = express()

require('dotenv').config()

app.use(cors())
app.use(helmet())

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // 5 calls
	}),
)

app.use(responseTime())

app.use(
	expressWinston.logger({
		transports: [new winston.transports.Console()],
		format: winston.format.json(),
		statusLevels: true,
		meta: false,
		msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
		expressFormat: true,
		ignoreRoute() {
			return false
		},
	}),
)

function createRandomUser() {
	return {
		userId: faker.string.uuid(),
		username: faker.internet.userName(),
		email: faker.internet.email(),
		avatar: faker.image.avatar(),
		password: faker.internet.password(),
		birthdate: faker.date.birthdate(),
		registeredAt: faker.date.past(),
	}
}

app.get('/users', (req, res) => {
	const USERS = faker.helpers.multiple(createRandomUser, {
		count: 5,
	})

	res.status(200).json(USERS)
})

app.listen(8000, () => {
	console.log('user service start')
})
