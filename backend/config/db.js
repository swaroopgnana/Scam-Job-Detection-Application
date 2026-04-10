import mongoose from "mongoose";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in backend/.env");
  }

  const maxRetries = Number(process.env.MONGO_MAX_RETRIES || 5);
  const baseDelayMs = Number(process.env.MONGO_RETRY_DELAY_MS || 1500);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const waitMs = baseDelayMs * attempt;
      const isSrvLookupError = String(error.message).includes("querySrv");
      const diagnosticHint = isSrvLookupError
        ? " Check Atlas cluster DNS, internet access, and Atlas IP/network access settings."
        : "";

      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}.${diagnosticHint}`);

      if (isLastAttempt) {
        throw new Error(`MongoDB connection failed after ${maxRetries} attempts`);
      }

      console.log(`Retrying MongoDB connection in ${waitMs}ms...`);
      await wait(waitMs);
    }
  }
};

export default connectDB;
