import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleCart, toggleSidebar } from "../../store/slices/popupSlice.js";
import {
  removeFromCart,
  updateCartQuantity,
} from "../../store/slices/cartSlice.js";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector((state) => state.popup);
  const { cart } = useSelector((state) => state.cart);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };

  let total = 0;
  if (cart && cart.length > 0) {
    total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(toggleCart())}
      ></div>

      {/* Cart SideBar */}
      <div className="fixed right-0 top-0 h-full w-[min(400px,90vw)] z-50 glass-panel bg-background/95 animate-slide-in-right flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[hsla(var(--glass-border))]">
          <h2 className="text-xl font-semibold text-primary">Shopping Cart</h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth transition-all"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {cart && cart.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4 md:w-24 md:h-24">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg">
                Your cart is empty.
              </p>
              <Link
                to={"/products"}
                onClick={() => dispatch(toggleCart())}
                className="inline-block mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold transition-all shadow-lg shadow-primary/20"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="glass-card p-4 hover:glow-on-hover animate-smooth transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm border border-border/50"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                        {item.product.name}
                      </h3>
                      <p className="text-primary font-bold text-lg">
                        ${item.product.price}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-secondary/30 rounded-lg p-1 border border-border/50">
                          <button
                            className="p-1 px-2 rounded hover:bg-background/50 transition-colors disabled:opacity-30"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1 px-2 rounded hover:bg-background/50 transition-colors"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          onClick={() =>
                            dispatch(removeFromCart(item.product.id))
                          }
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.length > 0 && (
          <div className="p-6 bg-background/50 backdrop-blur-md border-t border-[hsla(var(--glass-border))] mt-auto space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-lg text-muted-foreground uppercase tracking-wider font-medium">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>

            <Link
              to={"/cart"}
              onClick={() => dispatch(toggleCart())}
              className="w-full py-4 block text-center bg-primary text-primary-foreground rounded-xl hover:glow-on-hover animate-smooth font-bold text-lg transition-all shadow-xl shadow-primary/25"
            >
              Checkout Now
            </Link>

            <button
              onClick={() => dispatch(toggleCart())}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
