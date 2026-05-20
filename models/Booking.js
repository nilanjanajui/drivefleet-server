import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
        carName: { type: String, required: true },
        carImage: { type: String },
        dailyRentPrice: { type: Number, required: true },
        pickupLocation: { type: String },
        userEmail: { type: String, required: true },
        userName: { type: String },
        driverNeeded: { type: Boolean, default: false },
        specialNote: { type: String, default: "" },
        bookingDate: { type: Date, default: Date.now },
        totalPrice: { type: Number },
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);