import mongoose from "mongoose";
import {User} from "../Types/userTypes";

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
    }
}, {timestamps: true});


const UserModel = mongoose.model<User>("users", UserSchema);
export default UserModel;