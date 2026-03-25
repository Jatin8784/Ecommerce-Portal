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
            <div className="glass-card p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                    <Truck className="w-6 h-6 text-primary" />
                    Track Order
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order ID: <span className="font-mono text-primary">#{orderDetails.id.slice(0, 12)}</span>
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Updates Enabled</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Est. Delivery: <span className="font-bold text-foreground">
                      {new Date(new Date(orderDetails.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                    </span>
                  </p>
                </div>
              </div>

              {isCancelled ? (
                <div className="flex items-center space-x-6 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-500 uppercase tracking-tight">Order Cancelled</h3>
                    <p className="text-muted-foreground">
                      This order was cancelled and no further updates will be provided.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-8 md:pl-0">
                  {/* Vertical line for mobile, horizontal for base desktop logic (we'll use vertical for all here for 'Flipkart' detail feel) */}
                  <div className="absolute left-[15px] md:left-1/2 top-4 bottom-4 w-1 bg-secondary -translate-x-1/2 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 w-full bg-primary transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      style={{ height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  <div className="space-y-12 relative">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      
                      // Simulated detailed logs
                      const logs = [
                        "Our warehouse has received your order and is preparing it.",
                        "Your package has been handed over to our courier partner.",
                        "Package is being delivered to your doorstep."
                      ];

                      return (
                        <div key={step.label} className={`flex items-start md:items-center gap-6 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                          <div className="flex-1 hidden md:block px-8 text-right">
                             {index % 2 === 0 && (
                               <div className={`${isActive ? 'opacity-100' : 'opacity-30'} transition-opacity`}>
                                 <h4 className="font-bold text-lg text-foreground">{step.label}</h4>
                                 <p className="text-sm text-muted-foreground mt-1 max-w-[200px] ml-auto">{logs[index]}</p>
                               </div>
                             )}
                          </div>

                          <div className="relative z-10">
                            <div 
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-700 transform border-2 ${
                                isActive 
                                  ? "bg-primary border-primary text-primary-foreground shadow-xl scale-110" 
                                  : "bg-background border-border text-muted-foreground"
                              } ${isCurrent ? "animate-pulse" : ""}`}
                            >
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>

                          <div className="flex-1 px-4 md:px-8 text-left">
                            <div className={`${isActive ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg text-foreground md:hidden">{step.label}</h4>
                                {index % 2 !== 0 && <h4 className="font-bold text-lg text-foreground hidden md:block">{step.label}</h4>}
                                {isCurrent && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-tighter">Current</span>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 max-w-[250px] md:hidden">{logs[index]}</p>
                              {index % 2 !== 0 && <p className="text-sm text-muted-foreground mt-1 max-w-[250px] hidden md:block">{logs[index]}</p>}
                              
                              {isActive && (
                                <p className="text-[10px] font-black text-primary uppercase mt-2">
                                  {index === 0 ? 'Today' : (index === 1 ? 'Expected Tomorrow' : 'Estimated Arrival')}
                                </p>
                              )}
                            </div>
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
