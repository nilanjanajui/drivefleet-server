import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        carName: { type: String, required: true },
        dailyRentPrice: { type: Number, required: true },
        carType: {
            type: String,
            enum: ["SUV", "Sedan", "Hatchback", "Luxury", "Truck", "Van"],
            required: true,
        },
        imageURL: { type: String, required: true },
        seatCapacity: { type: Number, required: true },
        pickupLocation: { type: String, required: true },
        description: { type: String, required: true },
        availability: { type: Boolean, default: true },
        booking_count: { type: Number, default: 0 },
        ownerEmail: { type: String, required: true },
        ownerName: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Car", carSchema);