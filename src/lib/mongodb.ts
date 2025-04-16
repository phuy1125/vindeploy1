import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Mongo URI not found!");
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// 👉 Khai báo type cho biến global để TypeScript không báo lỗi
declare global {
  // Chỉ định rõ với Node.js globalThis
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Dùng globalThis thay vì var
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

clientPromise
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err));

export default clientPromise;
