const express = require('express');
const { createBooking, getBooking, getSingleBooking, updateBooking, deleteBooking, finalizeBooking, bookingconfirm } = require('../controller/booking.controller');
const bookingrouter = express.Router();

// POST request to book a room
bookingrouter.post('/checker', createBooking);
bookingrouter.post('/create', finalizeBooking);
bookingrouter.get('/all', getBooking);
bookingrouter.get('/confirm', bookingconfirm);
bookingrouter.get('/single/:id', getSingleBooking);
bookingrouter.put('/update/:id', updateBooking);
bookingrouter.delete('/deleter/:id', deleteBooking);

module.exports = bookingrouter;