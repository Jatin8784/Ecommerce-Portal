import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle, Sparkles, Check, Image as ImageIcon } from "lucide-react";
import removeBackground from "@imgly/background-removal";
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
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgStatus, setBgStatus] = useState("");

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveBackgrounds = async () => {
    if (!formData.images || formData.images.length === 0) {
      toast.error("Please select at least one image first.");
      return;
    }

    setIsRemovingBg(true);
    setBgStatus("Processing AI background removal...");
    try {
      const processedFiles = [];
      const newPreviews = [];

      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        setBgStatus(`Removing background (${i + 1}/${formData.images.length})...`);
        const blob = await removeBackground(file);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + "_transparent.png";
        const newFile = new File([blob], newFileName, { type: "image/png" });
        processedFiles.push(newFile);
        newPreviews.push(URL.createObjectURL(blob));
      }

      setFormData((prev) => ({ ...prev, images: processedFiles }));
      setPreviews(newPreviews);
      toast.success("Backgrounds removed successfully!");
    } catch (error) {
      console.error("Background Removal Error:", error);
      toast.error("Failed to remove background. Original images retained.");
    } finally {
      setIsRemovingBg(false);
      setBgStatus("");
    }
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
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-[#1a1c23] rounded-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => dispatch(toggleCreateProductModal())}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
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
              className="border px-4 py-2 rounded text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
              required
            />
            <select
              className="w-full border p-2 rounded-lg text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
              className="border px-4 py-2 rounded text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
              className="border px-4 py-2 rounded text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
              required
            />

            {/* Image Selection & AI Background Removal */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Images
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border px-4 py-2 rounded flex-1 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                {formData.images.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveBackgrounds}
                    disabled={isRemovingBg}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded transition font-medium"
                  >
                    {isRemovingBg ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        <span>Removing BG...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Remove BG (AI)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {bgStatus && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">
                  {bgStatus}
                </p>
              )}

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-[#f0f0f0] dark:bg-gray-800 shadow-sm flex items-center justify-center">
                      <img
                        src={src}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-contain"
                      />
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
              className="border px-4 py-2 rounded col-span-1 md:col-span-2 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
              rows={4}
              required
            />

            <button
              type="submit"
              disabled={loading || isRemovingBg}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 px-6 rounded col-span-1 md:col-span-2 font-semibold transition"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-6 h-6 animate-spin" />
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
