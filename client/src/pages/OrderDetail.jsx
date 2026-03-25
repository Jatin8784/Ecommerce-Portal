import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../store/slices/orderSlice";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  ArrowLeft,
  Loader,
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, fetchingOrderDetails } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
    const interval = setInterval(() => {
      dispatch(fetchOrderDetails(id));
    }, 15000);

    return () => clearInterval(interval);
  }, [dispatch, id]);

  if (fetchingOrderDetails && !orderDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Order Not Found
        </h2>
        <Link to="/orders" className="text-primary hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { label: "Processing", icon: Package, color: "text-yellow-500" },
    { label: "Shipped", icon: Truck, color: "text-blue-500" },
    { label: "Delivered", icon: CheckCircle, color: "text-green-500" },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.label === orderDetails.order_status
  );

  const isCancelled = orderDetails.order_status === "Cancelled";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <Link
          to="/orders"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Real-Time Tracking Timeline */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">
                  Order Tracking
                </h2>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground animate-pulse">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Live Tracking Enabled</span>
                </div>
              </div>

              {isCancelled ? (
                <div className="flex items-center space-x-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-500">Order Cancelled</h3>
                    <p className="text-sm text-red-400/80">
                      This order was cancelled and will not be processed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 hidden md:block"></div>
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 hidden md:block"
                    style={{
                      width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div
                          key={step.label}
                          className="flex md:flex-col items-center space-x-4 md:space-x-0 group w-full md:w-auto"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                : "bg-secondary text-muted-foreground"
                            } ${isCurrent ? "animate-bounce" : ""}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="md:mt-4 text-left md:text-center">
                            <p
                              className={`font-semibold transition-colors ${
                                isActive ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isActive && (
                              <p className="text-xs text-muted-foreground">
                                {isCurrent ? "Current Status" : "Completed"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ordered Items
              </h2>
              <div className="space-y-4">
                {orderDetails.order_items?.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Price: ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 text-right">
                      <p className="text-lg font-bold text-primary">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-2 border-t border-[hsla(var(--glass-border))] pt-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${orderDetails.total_price - (orderDetails.shipping_price || 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>${orderDetails.shipping_price || 0}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">${orderDetails.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Order Overview */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Order Summary</span>
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="text-foreground font-mono">
                    #{orderDetails.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placed On</span>
                  <span className="text-foreground">
                    {new Date(orderDetails.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                      orderDetails.order_status === "Delivered"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {orderDetails.order_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <div className="flex items-center space-x-1 text-foreground">
                    <CreditCard className="w-3 h-3" />
                    <span>{orderDetails.payment_method}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Shipping Details</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {orderDetails.shipping_info?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {orderDetails.shipping_info?.address},<br />
                      {orderDetails.shipping_info?.city},{" "}
                      {orderDetails.shipping_info?.state},<br />
                      {orderDetails.shipping_info?.country} -{" "}
                      {orderDetails.shipping_info?.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-foreground">
                      {orderDetails.shipping_info?.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contact Number
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="glass-card p-6 bg-primary/5 border-primary/20">
              <h4 className="font-bold text-foreground mb-2">Need help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions regarding your order, please contact
                our support team.
              </p>
              <Link
                to="/contact"
                className="block w-full text-center py-2 relative rounded-lg bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
