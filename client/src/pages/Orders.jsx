import React, { useEffect, useState } from "react";
import { Filter, Package, Truck, CheckCircle, XCircle, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../store/slices/orderSlice";
import OrderCardSkeleton from "../components/Orders/OrderCardSkeleton";
import { addToCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const { myOrders, fetchingOrders } = useSelector((state) => state.order);
  const { authUser } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (!authUser) return navigate("/products");

  const filterOrders = myOrders.filter(
    (order) => statusFilter === "All" || order.order_status === statusFilter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400";
      case "Shipped":
        return "bg-blue-500/20 text-blue-400";
      case "Delivered":
        return "bg-green-500/20 text-green-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const statusArray = [
    "All",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  
  const handleReorder = (order) => {
    order.order_items.forEach((item) => {
      const productForCart = {
        id: item.product_id,
        name: item.title,
        price: item.price,
        images: [{ url: item.image }]
      };
      dispatch(addToCart({ product: productForCart, quantity: item.quantity }));
    });
    toast.success("Items added to cart!");
    navigate("/cart");
  };

  const handleWriteReview = (order) => {
    if (order.order_items && order.order_items.length > 0) {
      navigate(`/product/${order.order_items[0].product_id}`, { 
        state: { activeTab: "reviews" } 
      });
    }
  };

  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/ekart-logo.png";

    logoImg.onload = () => {
      // --- HEADER SECTION ---
      // Logo and Company Info
      try {
        doc.addImage(logoImg, "PNG", 20, 15, 25, 25);
      } catch (e) {
        console.error("Logo add failed", e);
      }
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185); // Primary Blue
      doc.text("E-KART", 50, 28);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("123 Tech Park, Silicon Valley", 50, 34);
      doc.text("support@ekart.com | +91 98765 43210", 50, 39);
      doc.text("www.e-kart.com", 50, 44);

      // Invoice Label
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 220, 220);
      doc.text("INVOICE", 190, 35, { align: "right" });

      // --- DETAILS SECTION ---
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(20, 52, 190, 52);

      // Customer Info (Left)
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("BILL TO:", 20, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(order.shipping_info?.full_name || authUser.name, 20, 68);
      doc.text(order.shipping_info?.address || "", 20, 73);
      doc.text(`${order.shipping_info?.city}, ${order.shipping_info?.state} - ${order.shipping_info?.pincode}`, 20, 78);
      doc.text(`Phone: ${order.shipping_info?.phone || ""}`, 20, 83);

      // Invoice Info (Right)
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE DETAILS:", 130, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice #: INV-${order.id.slice(-8).toUpperCase()}`, 130, 68);
      doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`, 130, 73);
      doc.text(`Payment: ${order.payment_method || "Online"}`, 130, 78);
      doc.text(`Status: ${order.order_status}`, 130, 83);

      // --- TABLE SECTION ---
      const tableData = order.order_items.map((item, index) => [
        index + 1,
        item.title,
        `$${item.price}`,
        item.quantity,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 92,
        head: [["#", "Product Description", "Price", "Qty", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: "bold",
          halign: "center" 
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 95 },
          2: { halign: "right" },
          3: { halign: "center" },
          4: { halign: "right", fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 20, right: 20 }
      });

      // --- SUMMARY SECTION ---
      const finalY = doc.lastAutoTable.finalY + 10;
      const subtotal = order.total_price - (order.shipping_price || 0);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", 150, finalY);
      doc.text(`$${subtotal.toFixed(2)}`, 190, finalY, { align: "right" });
      
      doc.text("Shipping:", 150, finalY + 5);
      doc.text(`$${(order.shipping_price || 0).toFixed(2)}`, 190, finalY + 5, { align: "right" });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(145, finalY + 8, 190, finalY + 8);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Grand Total:", 145, finalY + 15);
      doc.text(`$${order.total_price}`, 190, finalY + 15, { align: "right" });

      // --- FOOTER SECTION ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(41, 128, 185);
      doc.rect(0, pageHeight - 15, 210, 15, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("Thank you for your order! Visit us again at e-kart.com", 105, pageHeight - 7, { align: "center" });

      doc.save(`Invoice_${order.id.slice(-8)}.pdf`);
      toast.success("Professional Invoice downloaded!");
    };
    
    logoImg.onerror = () => {
      // Fallback
      doc.setFontSize(22);
      doc.text("E-KART INVOICE", 105, 20, { align: "center" });
      doc.save(`Invoice_${order.id.slice(-8)}.pdf`);
      toast.info("Invoice generated without logo.");
    };
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your order history.
          </p>
        </div>

        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2 text-primary shrink-0">
              <Filter className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Filter by status:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusArray.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize border ${
                    statusFilter === status
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "glass-card hover:glow-on-hover text-muted-foreground border-border/50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders */}
        {fetchingOrders ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filterOrders.length === 0 ? (
          <div className="text-center glass-panel max-w-md mx-auto">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Orders Found
            </h2>
            <p className="text-muted-foreground">
              {statusFilter === "All"
                ? "You haven't placed any order yet."
                : `No orders with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filterOrders.map((order) => (
              <div key={order.id} className="glass-card p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Orders #{order.id}
                    </h3>
                    <p className="text-muted-foreground">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.order_status)}
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-primary">
                        ${order.total_price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order?.order_items?.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[hsla(var(--glass-border))]">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="flex items-center justify-center px-4 py-2.5 glass-card hover:glow-on-hover text-xs sm:text-sm font-bold transition-all h-full"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="flex items-center justify-center px-4 py-2.5 glass-card hover:glow-on-hover text-xs sm:text-sm font-bold transition-all h-full"
                  >
                    Track Order
                  </button>

                  {order.order_status === "Delivered" && (
                    <>
                      <button 
                        onClick={() => handleWriteReview(order)}
                        className="flex items-center justify-center px-4 py-2.5 glass-card hover:glow-on-hover text-xs sm:text-sm font-bold transition-all h-full"
                      >
                        Write Review
                      </button>
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center justify-center px-4 py-2.5 glass-card hover:glow-on-hover text-xs sm:text-sm font-bold space-x-2 transition-all h-full"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">Invoice</span>
                      </button>
                      <button 
                        onClick={() => handleReorder(order)}
                        className="flex items-center justify-center px-4 py-2.5 glass-card hover:glow-on-hover text-xs sm:text-sm font-bold transition-all h-full"
                      >
                        Reorder
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
