import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleUpdateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle, X } from "lucide-react";
import { updateProduct } from "../store/slices/productsSlice";

const UpdateProductModal = ({ selectedProduct }) => {
  const { loading } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    newImages: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

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

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || "",
        category: selectedProduct.category || "",
        stock: selectedProduct.stock || "",
        newImages: [],
      });
      setExistingImages(selectedProduct.images || []);
      setNewPreviews([]);
    }
  }, [selectedProduct]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, newImages: [...prev.newImages, ...files] }));
    setNewPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);

    for (let i = 0; i < formData.newImages.length; i++) {
      data.append("images", formData.newImages[i]);
    }

    dispatch(updateProduct(data, selectedProduct.id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-[#1a1c23] rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => dispatch(toggleUpdateProductModal())}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Update Product
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              setFormData({ ...formData, price: e.target.value })
            }
            className="border px-4 py-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="border px-4 py-2.5 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
            required
          />

          {/* Product Images Selector & Previews */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Images
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`Current ${i}`}
                      className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            <label className="block text-xs text-gray-500 dark:text-gray-400">
              Upload New Images (Optional - replaces current images if selected):
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="border px-4 py-2 rounded-lg w-full text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 cursor-pointer"
            />

            {/* New Image Previews */}
            {newPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group">
                    <img
                      src={src}
                      alt={`New Preview ${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
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
              setFormData({ ...formData, description: e.target.value })
            }
            className="border px-4 py-2.5 rounded-lg col-span-1 md:col-span-2 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
            rows={4}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl col-span-1 md:col-span-2 font-semibold transition shadow-md"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-5 h-5 animate-spin" />
                Updating Product...
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;
