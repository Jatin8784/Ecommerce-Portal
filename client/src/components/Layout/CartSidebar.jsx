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
      0
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
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg">Your cart is empty.</p>
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
                <div key={item.product.id} className="glass-card group p-3 hover:glow-on-hover animate-smooth transition-all border border-border/40">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-border/20 shadow-sm">
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-foreground truncate text-sm sm:text-base leading-tight">
                            {item.product.name}
                          </h3>
                          <button
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            onClick={() => dispatch(removeFromCart(item.product.id))}
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-primary font-black text-lg">
                          ${item.product.price}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-secondary/40 backdrop-blur-md rounded-xl p-1 border border-border/50 shadow-inner">
                          <button
                            className="p-1.5 rounded-lg hover:bg-background/80 hover:shadow-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed text-foreground"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center font-bold text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1.5 rounded-lg hover:bg-background/80 hover:shadow-sm transition-all text-foreground"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.length > 0 && (
          <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-[hsla(var(--glass-border))] mt-auto space-y-5 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <div className="space-y-3 px-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">Subtotal</span>
                <span className="text-xl font-bold text-foreground">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">Shipping</span>
                <span className="text-sm font-bold text-green-500">Calculated at checkout</span>
              </div>
              <div className="pt-3 border-t border-border/40 flex justify-between items-center">
                <span className="text-base font-black text-foreground uppercase">Estimated Total</span>
                <span className="text-2xl font-black text-primary drop-shadow-sm">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to={"/cart"}
                onClick={() => dispatch(toggleCart())}
                className="w-full py-4 block text-center bg-primary text-primary-foreground rounded-2xl hover:glow-on-hover animate-smooth font-black text-lg uppercase tracking-wider transition-all shadow-xl shadow-primary/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                <span className="relative">Checkout Now</span>
              </Link>
              
              <button 
                onClick={() => dispatch(toggleCart())}
                className="w-full text-center text-xs font-bold text-muted-foreground hover:text-primary transition-all py-2 uppercase tracking-widest"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
