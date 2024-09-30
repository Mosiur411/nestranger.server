const { bookingPaymentClientSecret, paymentreceipt } = require("../config/stripe.config");
const { BookingModel } = require("../model/booking.model");
const { ProprietaryModel } = require("../model/proprietary.model");

const createBooking = async (req, res) => {
    try {

        const { user, roomId, startDate, endDate } = req.body;
        if (!user || !roomId || !startDate || !endDate) {
            return res.status(400).json({ message: 'All fields (user, roomId, startDate, endDate) are required' });
        }
        // Ensure valid dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return res.status(400).json({ message: 'Invalid startDate or endDate' });
        }
        // Find the room by ID
        const room = await ProprietaryModel.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        // Check if the room is already booked for the given date range
        const existingBooking = await BookingModel.findOne({
            room: roomId,
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
            ]
        });
        if (existingBooking) {
            return res.status(409).json({ message: 'Room is already booked for the selected date range' });
        }
        // Calculate the number of days (round up)
        const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        // Calculate total price
        const totalPrice = numberOfDays * room.timeframe.prices;
        // Create new booking
        const clientSecret = await bookingPaymentClientSecret(totalPrice)
        if (clientSecret) {
            const booking = new BookingModel({
                user,
                room: roomId,
                city: room?.location?.city,
                startDate,
                endDate,
                totalPrice,
                payment_info: {
                    type: 'stripe',
                    transactionId: clientSecret.id,
                    paid: false
                }
            });
            if (!booking) return res.status(400).json({ message: 'Data Not Right' });
            await booking.save()
            return res.status(201).json({ message: 'Booking successful', clientSecret: { ...clientSecret, bookingId: booking?._id } });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Booking failed', error: error.message });
    }
};
const finalizeBooking = async (req, res) => {
    try {
        const { user, roomId, startDate, endDate, paymentIntentId } = req.body;

        // Verify that the PaymentIntent was successful
        const paymentIntent = await paymentreceipt(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment was not successful' });
        }

        // Proceed with saving the booking
        const start = new Date(startDate);
        const end = new Date(endDate);
        const room = await ProprietaryModel.findById(roomId);

        const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = numberOfDays * room.timeframe.prices;

        const booking = new BookingModel({
            user,
            room: roomId,
            city: room?.location?.city,
            startDate,
            endDate,
            totalPrice,
            payment_info: {
                type: 'Stripe',
                transactionId: paymentIntent.id,
                paid: true
            }
        });

        // Save booking in the database
        await booking.save();

        return res.status(201).json({ message: 'Booking confirmed and saved', booking });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to finalize booking', error: error.message });
    }
};



const getBooking = async (req, res) => {
    try {
        let query = {};
        const { status, search, page = 1, limit = 10 } = req.query;

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Search by user name, email, or payment transactionId
        if (search) {
            const escapedSearchTerm = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchValue = new RegExp(escapedSearchTerm, 'i');
            query.$or = [
                { "user.name": searchValue },
                { "user.email": searchValue },
                { "payment_info.transactionId": searchValue }
            ];
        }

        // Calculate pagination
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Sorting logic: sort by a specified field and order

        // Fetch the bookings with pagination, sorting, and population
        console.log(query)
        const bookings = await BookingModel.find(query)
            .populate('room')
            .skip(skip)
            .limit(limitNumber);

        // Get total count of bookings matching the query
        const totalBookings = await BookingModel.countDocuments(query);

        // Respond with the paginated bookings
        return res.status(200).json({
            totalPages: Math.ceil(totalBookings / limitNumber),
            currentPage: pageNumber,
            totalBookings,
            data: bookings
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
    }
};

const bookingconfirm = async (req, res) => {
    try {
        const { bookingId, redirect_status } = req.query;
        if (redirect_status === 'succeeded') {
            const updatedBooking = await BookingModel.findByIdAndUpdate(bookingId, {
                $set: {
                    "payment_info.paid": true
                }
            }, { new: true });
            if (!updatedBooking) return res.redirect(`http://localhost:3000/error`)
            return res.redirect(`http://localhost:3000/succeeded`)
        }


    } catch (error) {
        return res.status(500).json({ message: 'Booking update failed' });
    }
}

const getSingleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(404).json({ message: 'Booking not found' });
        const booking = await BookingModel.findById(id).populate('room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        return res.status(200).json(booking);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
    }
};


const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedBooking = await BookingModel.findByIdAndUpdate(id, {
            status: status,
        }, { new: true });

        if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });

        return res.status(200).json({ message: 'Booking updated', updatedBooking });
    } catch (error) {
        return res.status(500).json({ message: 'Booking update failed', error: error.message });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await BookingModel.findByIdAndDelete(id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        return res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Booking deletion failed', error: error.message });
    }
};

module.exports = { createBooking, deleteBooking, updateBooking, getSingleBooking, getBooking, finalizeBooking, bookingconfirm };
