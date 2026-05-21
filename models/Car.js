import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        carName: {
            type: String,
            required: [true, "Car name is required"],
            trim: true,
        },
        dailyRentPrice: {
            type: Number,
            required: [true, "Daily rent price is required"],
            min: [0, "Price cannot be negative"],
        },
        carType: {
            type: String,
            enum: ["SUV", "Sedan", "Hatchback", "Luxury", "Truck", "Van"],
            required: [true, "Car type is required"],
        },
        imageURL: {
            type: String,
            required: [true, "Image URL is required"],
        },
        seatCapacity: {
            type: Number,
            required: [true, "Seat capacity is required"],
            min: 1,
        },
        pickupLocation: {
            type: String,
            required: [true, "Pickup location is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        availability: {
            type: Boolean,
            default: true,
        },
        booking_count: {
            type: Number,
            default: 0,
        },
        ownerEmail: {
            type: String,
            required: [true, "Owner email is required"],
            lowercase: true,
        },
        ownerName: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Prevent model recompilation on hot reload
export default mongoose.models?.Car || mongoose.model("Car", carSchema);