import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
    mongoose.set("strictQuery", true);

    if(!process.env.MONGODB_URI) {
        return console.error("=> MONGODB_URI is not defined")
    }

    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {autoCreate:true});
        isConnected = true;
    } catch {
        console.log("Error connecting to database")
    }

}