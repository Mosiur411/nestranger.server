const express = require('express')
const cloudinary = require('cloudinary')
const cors = require('cors'); 
const { connectDatabase } = require('./config/db.config')
const proprietariesrouter = require('./routes/proprietary.routes')
const bookingrouter = require('./routes/booking.route')
const app = express()
require('dotenv').config()
const port = 5001
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Hello World!1')
})
app.use('/uploads', express.static('public'));
app.use('/v1/proprietaries', proprietariesrouter)
app.use('/v1/booking', bookingrouter)

/* database */
const mongodb_uri = process.env.ENV !== 'dev' ? process.env.PROD_DB : process.env.DEV_DB
connectDatabase(mongodb_uri)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
app.listen(port, () => {
  console.log(`Url: http://localhost:${port}/`)
})