import mongoose from "mongoose";
import {Address, Gender, Role, User, OTP} from "../Types/userTypes";

// address schema
const AddressSchema = new mongoose.Schema<Address>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true , default: "44000"},
    country: { type: String, required: true, default: "Pakistan" },
  });

const otpSchema = new mongoose.Schema<OTP>({
    otpNumber: {
        type: Number,
        default: undefined
    },
    expiresIn: {
        type: Number,
        default: undefined
    }
});

const UserSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.User
    },
    phone_no: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: true,
        default: Gender.Male
    },
    address: {
        type: AddressSchema,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    otp: {
        type: otpSchema,
    }
}, {timestamps: true});

const UserModel = mongoose.model<User>("users", UserSchema);
export default UserModel;