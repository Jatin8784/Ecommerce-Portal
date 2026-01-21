import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  Loader,
  CircleDollarSign,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ReviewsContainer from "../components/Products/ReviewsContainer";
import { addToCart } from "../store/slices/cartSlice.js";
import { fetchProductDetails } from "../store/slices/productSlice.js";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.product?.productDetails);
  const { loading, productReviews } = useSelector((state) => state.product);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const navigate = useNavigate();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
  };

  const handleCopyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        toast.success("URL Copied ", currentURL);
      })
      .catch((err) => {
        console.log("Failed to copy:", err);
      });
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity }));
    navigate("/payment");
  };

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Product Not Found.
          </h1>
          <p className="text-muted-foreground">
            The Product you're looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="glass-card p-4 mb-4">
                {product.images ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-964 object-contain rounded-lg"
                  />
                ) : (
                  <div className="glass-card min-h-[418px] p-4 mb-4 animate-pulse" />
                )}
              </div>
              <div className="flex space-x-2">
                {product.images &&
                  product?.images.map((image, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image?.url}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  {new Date() - new Date(product.created_at) <
                    30 * 24 * 60 * 60 * 1000 && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                      NEW
                    </span>
                  )}
                  {product.ratings >= 4.5 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-rose-500 bg-primary text-white text-primary-foreground text-xs font-semibold rounded">
                      Top RATED
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => {
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.ratings)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-foreground font-medium">
                    {product.ratings}
                  </span>
                  <span className="text-muted-foreground">
                    ({productReviews?.length})reviews
                  </span>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-muted-foreground">
                    Category: {product.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      product.stock > 5
                        ? "bg-green-500/20 text-green-400"
                        : product.stock > 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {product.stock > 5
                      ? "In Stock"
                      : product.stock > 0
                        ? "Limited Stock"
                        : "Out of stock"}
                  </span>
                </div>
                <div className="glass-card p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-lg font-medium">Quantity:</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 glass-card hover:glow-on-hover animate-smooth"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 glass-card hover:glow-on-hover animate-smooth"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex items-center justify-center space-x-2 py-3 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      disabled={product.stock === 0}
                      className="flex items-center justify-center space-x-2 py-3 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleBuyNow}
                    >
                      <CircleDollarSign className="w-5 h-5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary animate-smooth">
                      <Heart className="w-5 h-5" />
                      <span>Add to Wishlist</span>
                    </button>
                    <button
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary animate-smooth"
                      onClick={handleCopyURL}
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="flex border-b border-[hsla(var(--glass-border))]">
              {["description", "reviews"].map((tab) => {
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium capitalize transition-all ${
                      activeTab === tab
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {activeTab === "description" && (
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Product Description
                  </h3>
                  <p className="text-muted-foreground loading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              {activeTab === "reviews" && (
                <>
                  <ReviewsContainer
                    product={product}
                    productReviews={productReviews}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
