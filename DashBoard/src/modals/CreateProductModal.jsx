import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

const CreateProductModal = () => {
  const { loading } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Electronics",
    stock: "",
    images: [],
  });

  const [previews, setPreviews] = useState([]);

  const categoryOptions = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Books",
    "Beauty",
    "Automotive",
    "Kids & Baby",
  ];

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"];
  const MAX_SIZE_MB = 5;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`"${file.name}" — unsupported format (only JPG, PNG, WebP, GIF, AVIF allowed)`);
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        invalidFiles.push(`"${file.name}" — too large (max ${MAX_SIZE_MB}MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((msg) => toast.error(msg));
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...validFiles] }));
      setPreviews((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
    }

    // Reset input so same file can be re-selected after fix
    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    dispatch(createNewProduct(data));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-white dark:bg-[#1a1c23] rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => dispatch(toggleCreateProductModal())}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Create New Product
          </h2>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Title"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="border px-4 py-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <select
              className="w-full border p-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price (₹)"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
              className="border px-4 py-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: e.target.value,
                })
              }
              className="border px-4 py-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
              required
            />

            {/* Product Images Selector */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Images
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 font-normal">(JPG, PNG, WebP, GIF, AVIF · max 5MB each)</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                onChange={handleImageChange}
                className="border px-4 py-2 rounded-lg w-full text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 cursor-pointer"
              />

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group">
                      <img
                        src={src}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="border px-4 py-2.5 rounded-lg col-span-1 md:col-span-2 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl col-span-1 md:col-span-2 font-semibold transition shadow-md"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Creating Product...
                </>
              ) : (
                "Add New Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProductModal;
