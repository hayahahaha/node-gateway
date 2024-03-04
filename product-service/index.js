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

function createRandomProduct() {
	return {
		productId: faker.string.uuid(),
		name: faker.commerce.product(),
		description: faker.commerce.productDescription(),
		price: faker.commerce.price({ min: 100, max: 200, dec: 0, symbol: '$' }),
		department: faker.commerce.department(),
	}
}

app.get('/products', (req, res) => {
	const PRODUCTS = faker.helpers.multiple(createRandomProduct, {
		count: 5,
	})

	res.status(200).json(PRODUCTS)
})

app.listen(8080, () => {
	console.log('product service start')
})
