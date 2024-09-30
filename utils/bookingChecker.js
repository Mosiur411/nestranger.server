const { BookingModel } = require("../model/booking.model");

const bookingCheckerHelp = async (data) => {
    const existingBooking = await BookingModel.findOne({
        city: data?.city,
        $or: [
            { startDate: { $lt: data?.startDate }, endDate: { $gt: data?.endDate } }
        ]
    });
    return existingBooking;
}
module.exports = { bookingCheckerHelp }