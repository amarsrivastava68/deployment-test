import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error(error , 'error in connecting to mongodb') ;
         process.exit(1); 
    }
}
export default connectToDB;