import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: String,
  description: String,
  description_history: String,
  address: String,
  openTime: String,
  price: String,
  streetViewUrls: [String],
  tags: [String],
});

const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);

export default Location;
