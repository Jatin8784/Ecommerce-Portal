import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../store/slices/cartSlice";
import { useDispatch } from "react-redux";

const ProductSlider = ({ title, products }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 glass-card hover:bg-gray-100 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 glass-card hover:bg-gray-100 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex shrink-0"
          >
            <div
              className="w-[280px] sm:w-80 glass-card hover:shadow-xl transition-all duration-300 group p-4 flex flex-col cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {new Date() - new Date(product.created_at) < 30 * 24 * 60 * 60 * 1000 && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase">
                      New
                    </span>
                  )}
                  {product.ratings >= 4.5 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-rose-500 text-white text-[10px] font-bold rounded uppercase">
                      Top Rated
                    </span>
                  )}
                </div>

                {/* Quick Add To Cart */}
                <button
                  className="absolute bottom-3 right-3 p-2 bg-white text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors truncate">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.ratings)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews_count})
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                      product.stock > 5
                        ? "bg-green-500/10 text-green-500"
                        : product.stock > 0
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {product.stock > 5
                      ? "In Stock"
                      : product.stock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSlider;
