import React, { useRef } from "react";
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
      const scrollAmount = 300;
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
    <section className="py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 border border-gray-200 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 border border-gray-200 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <div className="relative h-40 mb-3 bg-gray-50 flex items-center justify-center rounded">
              <img
                src={product.images[0].url}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
            
            <h3 className="font-semibold text-gray-800 truncate mb-1">{product.name}</h3>
            
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.floor(product.ratings) ? "currentColor" : "none"}
                    className={i < Math.floor(product.ratings) ? "" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 ml-1">({product.reviews_count})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">${product.price}</span>
              <span className="text-[10px] text-gray-500">{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSlider;
