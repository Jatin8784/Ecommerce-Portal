import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Check, MapPin, Loader2, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PlaceOrder, VerifyPayment, resetOrderState, deleteOrder } from "../store/slices/orderSlice.js";
import { toast } from "sonner";
import { clearCart } from "../store/slices/cartSlice.js";
import LocationPickerModal from "../components/Products/LocationPickerModal";

const Payment = () => {
  const { authUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  if (!authUser) return navigate("/products");

  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { 
    orderStep, 
    razorpayOrderId, 
    razorpayAmount, 
    razorpayCurrency, 
    currentOrderId,
    placingOrder 
  } = useSelector((state) => state.order);
  
  const [paymentMethod, setPaymentMethod] = useState("Online"); // Renamed from Stripe
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    state: "Gujarat",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India",
  });

  const handleSelectLocationFromMap = (loc) => {
    setShippingDetails((prev) => ({
      ...prev,
      address: loc.address || loc.fullDisplay,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      zipCode: loc.pincode || prev.zipCode,
      country: loc.country || "India",
    }));
  };

  const handleAddressInputChange = (e) => {
    const val = e.target.value;
    setShippingDetails((prev) => ({ ...prev, address: val }));

    if (val.trim().length > 2) {
      setIsSearchingAddress(true);
      setShowSuggestions(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=in`
      )
        .then((res) => res.json())
        .then((data) => {
          setAddressSuggestions(data || []);
          setIsSearchingAddress(false);
        })
        .catch(() => {
          setIsSearchingAddress(false);
        });
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const addr = item.address || {};
    const detectedCity = addr.city || addr.town || addr.district || addr.county || "";
    const detectedState = addr.state || "Gujarat";
    const detectedAddress = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood]
      .filter(Boolean)
      .join(", ") || item.display_name?.split(",").slice(0, 3).join(",");
    const detectedPincode = addr.postcode || "";

    setShippingDetails((prev) => ({
      ...prev,
      address: detectedAddress || item.display_name,
      city: detectedCity || prev.city,
      state: detectedState || prev.state,
      zipCode: detectedPincode || prev.zipCode,
      country: addr.country || "India",
    }));

    setShowSuggestions(false);
    toast.success("Location selected and fields auto-filled!");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    toast.info("Detecting your exact GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            const detectedCity = addr.city || addr.town || addr.district || addr.county || "";
            const detectedState = addr.state || "Gujarat";
            const detectedAddress = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood]
              .filter(Boolean)
              .join(", ") || data.display_name?.split(",").slice(0, 3).join(",");
            const detectedPincode = addr.postcode || "";

            setShippingDetails((prev) => ({
              ...prev,
              address: detectedAddress || prev.address,
              city: detectedCity || prev.city,
              state: detectedState || prev.state,
              zipCode: detectedPincode || prev.zipCode,
              country: addr.country || "India",
            }));

            toast.success("Exact location detected!");
          }
        } catch (err) {
          console.error("Location lookup error:", err);
          toast.error("Failed to fetch address details from GPS coordinates");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        toast.error("Unable to retrieve GPS location. Please enter manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingFee = total >= 500 ? 0 : 50;
  const totalWithShipping = total + shippingFee;
  const gstInclusiveAmount = total * (18 / 118);

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
      payment_method: paymentMethod === "Online" ? "Online" : "COD",
      orderedItems: cart,
    };

    dispatch(PlaceOrder(payload));
  };

  const handleRazorpayPayment = useCallback(() => {
    if (!razorpayOrderId) return;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayAmount,
      currency: razorpayCurrency,
      name: "E-Kart",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async (response) => {
        const verifyData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: currentOrderId,
        };
        const result = await dispatch(VerifyPayment(verifyData));
        if (result.payload?.success) {
          dispatch(clearCart());
        }
      },
      prefill: {
        name: shippingDetails.fullName,
        contact: shippingDetails.phone,
        email: authUser.email,
      },
      theme: {
        color: "#6366f1",
      },
      modal: {
        ondismiss: function () {
          if (currentOrderId) {
            dispatch(deleteOrder(currentOrderId));
          }
          setPaymentCancelled(true);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [
    razorpayOrderId, 
    razorpayAmount, 
    razorpayCurrency, 
    currentOrderId, 
    shippingDetails, 
    authUser.email, 
    dispatch
  ]);

  useEffect(() => {
    if (orderStep === 2 && paymentMethod === "Online" && !paymentCancelled) {
      handleRazorpayPayment();
    }
    if (orderStep === 3) {
      toast.success("Order Placed Successfully!");
      dispatch(clearCart());
    }
  }, [orderStep, paymentMethod, handleRazorpayPayment, dispatch, paymentCancelled]);

  useEffect(() => {
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch]);

  if (cart.length === 0 && orderStep !== 3) {
    // ... same as before
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
              <div className="flex items-center space-x-2 sm:space-x-4 scale-90 sm:scale-100">
                {/* Step 1 */}
                <div
                  className={`flex items-center space-x-1 sm:space-x-2 ${
                    orderStep >= 1 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      orderStep >= 1
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {orderStep > 1 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : "1"}
                  </div>
                  <span className="font-medium text-sm sm:text-base">Details</span>
                </div>

                <div
                  className={`w-8 sm:w-12 h-0.5 ${
                    orderStep >= 2 ? "bg-primary" : "bg-border"
                  }`}
                />

                {/* Step 2 */}
                <div
                  className={`flex items-center space-x-1 sm:space-x-2 ${
                    orderStep >= 2 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      orderStep >= 2
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {orderStep > 2 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : "2"}
                  </div>
                  <span className="font-medium text-sm sm:text-base">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                {orderStep === 1 ? (
                  // Step 1: User Details
                  <form onSubmit={handlePlaceOrder} className="glass-panel">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        Shipping Information
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsMapModalOpen(true)}
                          className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg gradient-primary text-primary-foreground hover:glow-on-hover transition-all shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Pick on Live Map</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border disabled:opacity-50"
                        >
                          {isDetectingLocation ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Navigation className="w-3.5 h-3.5 text-primary fill-primary/20" />
                          )}
                          <span>{isDetectingLocation ? "Locating..." : "Use Current Location"}</span>
                        </button>
                      </div>
                    </div>
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
                        <input
                          type="text"
                          placeholder="e.g. Gujarat, Maharashtra, Delhi..."
                          value={shippingDetails.state}
                          onChange={(e) => {
                            setShippingDetails({
                              ...shippingDetails,
                              state: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
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

                    <div className="mb-6 relative">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2 flex items-center justify-between">
                          <span>Address (Street / Building / Landmark) *</span>
                          <span className="text-xs text-primary font-normal">Type for live location suggestions</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={shippingDetails.address}
                            onChange={handleAddressInputChange}
                            onFocus={() => shippingDetails.address.length > 2 && setShowSuggestions(true)}
                            placeholder="Start typing your street address or building..."
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-10"
                            required
                          />
                          {isSearchingAddress && (
                            <div className="absolute right-3 top-3.5">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>

                        {showSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                            {addressSuggestions.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectSuggestion(item)}
                                className="p-3 hover:bg-primary/10 cursor-pointer flex items-start space-x-3 text-sm border-b border-border/40 last:border-0 transition-colors"
                              >
                                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-foreground truncate">
                                    {item.display_name?.split(",")[0]}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.display_name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                          onClick={() => setPaymentMethod("Online")}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            paymentMethod === "Online"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "Online"
                                  ? "border-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {paymentMethod === "Online" && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="font-medium">Online Payment</span>
                          </div>
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                            alt="Razorpay"
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
                      disabled={placingOrder}
                      className="w-full py-4 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-bold text-lg disabled:opacity-50"
                    >
                      {placingOrder ? "Placing Order..." : (paymentMethod === "Online" ? "Continue to Payment" : "Place Order")}
                    </button>
                  </form>
                ) : (
                  <div className="glass-panel text-center py-12">
                    {orderStep === 3 ? (
                      <>
                        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <Check className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                          Order Placed Successfully!
                        </h2>
                        <p className="text-muted-foreground mb-8">
                          Thank you for your purchase. You can track your order in the orders section.
                        </p>
                        <Link
                          to={"/orders"}
                          onClick={() => dispatch(resetOrderState())}
                          className="inline-flex items-center space-x-2 px-8 py-3 rounded-lg text-primary-foreground gradient-primary animate-smooth hover:glow-on-hover font-semibold"
                        >
                          View My Orders
                        </Link>
                      </>
                    ) : paymentCancelled ? (
                      <>
                        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                           <div className="w-10 h-10 border-4 border-destructive border-t-transparent rounded-full"></div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-destructive">
                          Payment Cancelled
                        </h2>
                        <p className="text-muted-foreground mb-8">
                          Your payment was not completed. You can try again or change payment method.
                        </p>
                        <button
                          onClick={() => {
                            setPaymentCancelled(false);
                            dispatch(resetOrderState());
                          }}
                          className="inline-flex items-center space-x-2 px-8 py-3 rounded-lg text-primary-foreground gradient-primary animate-smooth hover:glow-on-hover font-semibold"
                        >
                          Try Again
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                          Processing Payment...
                        </h2>
                        <p className="text-muted-foreground">
                          Please complete the payment in the Razorpay popup.
                        </p>
                      </>
                    )}
                  </div>
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
                          ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={total >= 500 ? "text-green-500" : ""}>
                        {total >= 500 ? "Free" : "₹50.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>GST (Inclusive 18%)</span>
                      <span>₹{gstInclusiveAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline font-bold text-xl pt-4 border-t border-border text-primary">
                      <div>
                        <div>Total Payable</div>
                        <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                          Inclusive of all taxes & GST
                        </div>
                      </div>
                      <span>₹{totalWithShipping.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleSelectLocationFromMap}
      />
    </>
  );
};

export default Payment;
