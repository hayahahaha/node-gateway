const express = require('express')
const session = require('express-session')
const rateLimit = require('express-rate-limit')
const winston = require('winston')
const expressWinston = require('express-winston')
const responseTime = require('response-time')
const cors = require('cors')
const helmet = require('helmet')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

require('dotenv').config()

const secret = process.env.SESSION_SECRET
const store = new session.MemoryStore()
const protect = (req, res, next) => {
	const { authenticated } = req.session

	if (!authenticated) {
		res.sendStatus(401)
	} else {
		next()
	}
}

app.use(cors())
app.use(helmet())

app.use(
	session({
		secret,
		resave: false,
		saveUninitialized: true,
		store,
	}),
)

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

app.get('/login', (req, res) => {
	const { authenticated } = req.session
	if (!authenticated) {
		req.session.authenticated = true
		res.send('Successfully authenticated')
	} else {
		res.send('Already authenticated')
	}
})

app.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.send('Successfully logged out')
	})
})

app.use(
	'/users',
	protect,
	createProxyMiddleware({
		target: 'http://localhost:8000',
		changeOrigin: true,
	}),
)

app.use(
	'/products',
	protect,
	createProxyMiddleware({
		target: 'http://localhost:8080',
		changeOrigin: true,
	}),
)

app.listen(3000, () => {
	console.log('start service')
})
