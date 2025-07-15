import mongoose from "mongoose";

const returnPolicySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const ReturnPolicy = mongoose.model("ReturnPolicy", returnPolicySchema);

export default ReturnPolicy;
