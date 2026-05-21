import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        car_name: {
            type: String,
            required: [true, "Car name is required"],
            trim: true,
        },
        daily_rent_price: {
            type: Number,
            required: [true, "Daily rent price is required"],
            min: [0, "Price cannot be negative"],
        },
        car_type: {
            type: String,
            enum: ["SUV", "Sedan", "Hatchback", "Luxury", "Sports Coupe", "Electric SUV", "Convertible", "Pickup Truck"],
            required: [true, "Car type is required"],
        },
        image_url: {
            type: String,
            required: [true, "Image URL is required"],
        },
        seat_capacity: {
            type: Number,
            required: [true, "Seat capacity is required"],
            min: 1,
        },
        pickup_location: {
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
        owner_email: {
            type: String,
            required: [true, "Owner email is required"],
            lowercase: true,
        },
        owner_name: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models?.Car || mongoose.model("Car", carSchema);