/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { PlaceOrder } from "../store/slices/orderSlice.js";
import { toast } from "react-toastify";
import { clearCart } from "../store/slices/cartSlice.js";

const Payment = () => {
  const { authUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  if (!authUser) return navigate("/products");

  const [stripePromise, setStripePromise] = useState(null);
  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripe = await loadStripe(
          "pk_test_51SiU5sEQnwHwcpnydmGBIpUNibkt4IHYoJJCKVYv1KlhsVwgnKa0UqGVOpVNytqtigo34wNvBFAQWpx0WePiE6Dj00aYHvYmN5"
        );
        setStripePromise(stripe);
      } catch (err) {
        console.error("Stripe load failed:", err);
      }
    };

    initStripe();
  }, []);

  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { orderStep } = useSelector((state) => state.order);
  const [paymentMethod, setPaymentMethod] = useState("Stripe");
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    state: "Gujarat",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India",
  });

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let totalWithTax = total + total * 0.18;

  if (total < 50) {
    totalWithTax += 2;
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const payload = {
      full_name: shippingDetails.fullName,
      state: shippingDetails.state,
      phone: shippingDetails.phone,
      address: shippingDetails.address,
      city: shippingDetails.city,
      pincode: shippingDetails.zipCode,
      country: shippingDetails.country,
      payment_method: paymentMethod,
      orderedItems: cart,
    };

    dispatch(PlaceOrder(payload));
  };

  useEffect(() => {
    if (orderStep === 3) {
      toast.success("Order Placed Successfully!");
      dispatch(clearCart());
      navigate("/orders");
    }
  }, [orderStep, navigate, dispatch]);

  if (cart.length === 0 && orderStep !== 3) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center glass-panel max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            No items in cart.
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before processing to checkout.
          </p>
          <Link
            to={"/products"}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-primary-foreground gradient-primary animate-smooth hover:glow-on-hover font-semibold"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <Link
                to={"/cart"}
                className="p-2 glass-card hover:glow-on-hover animate-smooth"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Link>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                {/* Step 1 */}
                <div
                  className={`flex items-center space-x-2 ${
                    orderStep >= 1 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      orderStep >= 1
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {orderStep > 1 ? <Check className="w-5 h-5" /> : "1"}
                  </div>
                  <span className="font-medium">Details</span>
                </div>

                <div
                  className={`w-12 h-0.5 ${
                    orderStep >= 2 ? "bg-primary" : "bg-border"
                  }`}
                />

                {/* Step 2 */}
                <div
                  className={`flex items-center space-x-2 ${
                    orderStep >= 2 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      orderStep >= 2
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {orderStep > 2 ? <Check className="w-5 h-5" /> : "2"}
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                {orderStep === 1 ? (
                  // Step 1: User Details
                  <form onSubmit={handlePlaceOrder} className="glass-panel">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      Shipping Information
                    </h2>
                    <div className="mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.fullName}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              fullName: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State *
                        </label>
                        <select
                          value={shippingDetails.state}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              state: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                        >
                          <option value="Gujarat">Gujarat</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Karachi">Karachi</option>
                          <option value="Goa">Goa</option>
                          <option value="Himachal Pradesh">
                            Himachal Pradesh
                          </option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={shippingDetails.phone}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              phone: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.address}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              address: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.city}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              city: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Country *
                        </label>
                        <select
                          value={shippingDetails.country}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              country: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                        >
                          <option value="India">India</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.zipCode}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              zipCode: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Payment Method
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => setPaymentMethod("Stripe")}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            paymentMethod === "Stripe"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "Stripe"
                                  ? "border-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {paymentMethod === "Stripe" && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="font-medium">Stripe (Card)</span>
                          </div>
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                            alt="Stripe"
                            className="h-6"
                          />
                        </div>

                        <div
                          onClick={() => setPaymentMethod("COD")}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            paymentMethod === "COD"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "COD"
                                  ? "border-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {paymentMethod === "COD" && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="font-medium">
                              Cash On Delivery
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-bold text-lg"
                    >
                      {paymentMethod === "Stripe"
                        ? "Continue to Payment"
                        : "Place Order"}
                    </button>
                  </form>
                ) : (
                  <>
                    {orderStep === 2 ? (
                      <Elements stripe={stripePromise}>
                        <PaymentForm />
                      </Elements>
                    ) : (
                      <div className="glass-panel text-center py-12">
                        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <Check className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                          Order Processing...
                        </h2>
                        <p className="text-muted-foreground">
                          Please wait while we complete your request.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass-panel sticky top-24">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={totalWithTax >= 50 ? "text-green-500" : ""}>
                        {totalWithTax >= 50 ? "Free" : "$2.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>{(total * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-border text-primary">
                      <span>Total</span>
                      <span>${totalWithTax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
