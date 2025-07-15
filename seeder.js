import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // Adjust the path if needed

dotenv.config();

const productsData = [
  {
    sku: "SKU001",
    image: "https://i.imgur.com/tXyOMMG.png",
    brandName: "LV",
    title: "Green Poplin Ruched Front",
    price: 120.0,
    priceAfterDiscount: 99.99,
    discountPercent: 17,
    description: "Lightweight waterproof easy for mountain adventures.",
    rating: 4.5,
    reviews: [],
  },
  {
    sku: "SKU002",
    image: "https://i.imgur.com/h2LqppX.png",
    brandName: "Nova",
    title: "Lipsy London",
    price: 120.0,
    priceAfterDiscount: 99.99,
    discountPercent: 17,
    description: "Lightweight waterproof easy for mountain adventures.",
    rating: 4.5,
    reviews: [],
  },
  {
    sku: "SKU003",
    image: "https://i.imgur.com/dbbT6PA.png",
    brandName: "UrbanPack",
    title: "Green Poplin Ruched Front",
    price: 74.99,
    description: "Multipurpose travel and office backpack with USB charging port.",
    rating: 4.8,
    reviews: [],
  },
  {
    sku: "SKU004",
    image: "https://i.imgur.com/V1MXgfa.png",
    brandName: "ChillFit",
    title: "Green Mountain Beta Warehouse",
    price: 59.99,
    priceAfterDiscount: 49.99,
    discountPercent: 17,
    description: "Classic fit hoodie with soft fleece lining.",
    rating: 4.0,
    reviews: [],
  },
  {
    sku: "SKU005",
    image: "https://i.imgur.com/8gvE5Ss.png",
    brandName: "Timelux",
    title: "Printed Sleeveless Tiered Swing Dress",
    price: 199.99,
    priceAfterDiscount: 49.99,
    discountPercent: 17,
    description: "Elegant leather strap watch with stainless steel body.",
    rating: 4.7,
    reviews: [],
  },
  {
    sku: "SKU006",
    image: "https://i.imgur.com/cBvB5YB.png",
    brandName: "Timelux",
    title: "Mountain Beta Warehouse",
    price: 299.99,
    priceAfterDiscount: 49.99,
    discountPercent: 17,
    description: "Elegant leather strap watch with stainless steel body.",
    rating: 4.7,
    reviews: [],
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    for (const product of productsData) {
      await Product.updateOne(
        { sku: product.sku }, // match by SKU
        { $set: product },
        { upsert: true }
      );
      console.log(`✅ Upserted product: ${product.sku}`);
    }

    console.log("🚀 All products upserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error.message);
    process.exit(1);
  }
};

seedProducts();
