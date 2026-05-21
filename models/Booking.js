import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car",
            required: [true, "Car ID is required"],
        },
        carName: {
            type: String,
            required: [true, "Car name is required"],
        },
        carImage: {
            type: String,
            default: "",
        },
        carType: {
            type: String,
            default: "",
        },
        dailyRentPrice: {
            type: Number,
            required: [true, "Daily rent price is required"],
        },
        pickupLocation: {
            type: String,
            default: "",
        },
        userEmail: {
            type: String,
            required: [true, "User email is required"],
            lowercase: true,
        },
        userName: {
            type: String,
            default: "",
        },
        driverNeeded: {
            type: Boolean,
            default: false,
        },
        specialNote: {
            type: String,
            default: "",
        },
        bookingDate: {
            type: Date,
            default: Date.now,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "confirmed",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models?.Booking || mongoose.model("Booking", bookingSchema);