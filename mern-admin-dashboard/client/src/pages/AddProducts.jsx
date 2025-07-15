import { useState } from "react";
import { createProduct } from "../api/productApi";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [form, setForm] = useState({
    sku: "",
    title: "",
    price: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduct(form);
    navigate("/products");
  };

  return (
    <div>
      <h2 className="text-xl mb-4 font-bold">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="sku"
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <button className="bg-blue-600 text-white p-2 rounded">Add</button>
      </form>
    </div>
  );
}
