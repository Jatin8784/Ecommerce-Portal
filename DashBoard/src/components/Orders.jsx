import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {
  deleteOrder,
  fetchAllOrders,
  updateOrderstatus,
} from "../store/slices/orderSlice.js";
import { OrderCardSkeleton } from "./Skeleton";
import DashboardPagination from "./common/DashboardPagination";

const Orders = () => {
  const statusArray = [
    "All",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const dispatch = useDispatch();
  const { orders, totalOrders, loading } = useSelector((state) => state.order);

  const [selectedStatus, setSelectedStatus] = useState({});
  const [filterByStatus, setFilterByStatus] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllOrders(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (totalOrders !== undefined) {
      const newMax = Math.ceil(totalOrders / 10) || 1;
      setMaxPage(newMax);
    }
  }, [totalOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus(newStatus);
    dispatch(updateOrderstatus({ orderId, status: newStatus }));
  };

  const filteredOrders =
    filterByStatus === "All"
      ? orders || []
      : orders?.filter((order) => order.order_status === filterByStatus);

  const confirmDelete = async () => {
    await dispatch(deleteOrder(deleteConfirm.id));
    dispatch(fetchAllOrders(page));
    setDeleteConfirm({ open: false, id: null });
  };

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full min-h-screen bg-gray-50 dark:bg-[#0f1115] transition-colors duration-300">
        {/* Header */}
        <div className="flex-1 md:p-6">
          <Header />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Orders</h1>
              <p className="text-sm text-gray-600">Manage all your orders.</p>
            </div>
            <select
              className="p-2 border rounded shadow-sm bg-white dark:bg-[#1a1c23] dark:border-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
            >
              {statusArray.map((status) => (
                <option key={status} value={status} className="dark:bg-[#1a1c23]">{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="md:px-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <OrderCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1c23] rounded-lg p-12 text-center shadow-md border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">No orders found.</h3>
              <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              {filteredOrders?.map((order) => {
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#1a1c23] shadow-md rounded-lg p-6 mb-6 transition-all hover:shadow-lg border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order ID: <span className="text-gray-900 dark:text-gray-100 font-bold font-mono">#{order.id.slice(-8)}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            order.order_status === 'Delivered' ? 'bg-green-500' :
                            order.order_status === 'Cancelled' ? 'bg-red-500' :
                            order.order_status === 'Shipped' ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'
                          }`} />
                          <p className="font-semibold text-gray-700 dark:text-gray-300">
                             {order.order_status}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <strong>Placed At:</strong>{" "}
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          Total: <span className="text-primary-foreground dark:text-primary">${order.total_price}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={
                            selectedStatus[order.id] || order.order_status
                          }
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="border p-2 rounded-md bg-white dark:bg-[#1a1c23] dark:border-gray-700 shadow-sm text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-gray-200"
                        >
                          {statusArray.filter(s => s !== "All").map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ open: true, id: order.id })
                          }
                          className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-md transition-colors font-medium border border-red-200 dark:border-red-900/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-black/20 rounded-lg">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-2 mb-2 flex items-center gap-2 text-sm uppercase">
                          <span className="w-1 h-4 bg-blue-500 rounded" />
                          Shipping Details
                        </h4>
                        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                          <p><strong>Name:</strong> {order.shipping_info?.full_name}</p>
                          <p><strong>Phone:</strong> {order.shipping_info?.phone}</p>
                          <p><strong>Address:</strong> {order.shipping_info?.address}, {order.shipping_info?.city}</p>
                          <p>{order.shipping_info?.state}, {order.shipping_info?.pincode}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-2 mb-2 flex items-center gap-2 text-sm uppercase">
                          <span className="w-1 h-4 bg-primary rounded" />
                          Order Items ({order.order_items?.length})
                        </h4>
                        <div className="space-y-3">
                          {Array.isArray(order.order_items) &&
                            order.order_items.map((item) => (
                              <div
                                key={`${order.id}-${item.product_id}`}
                                className="flex items-center gap-3"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setPreviewImage(item.image)}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm">{item.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.quantity} x ${item.price} = <span className="text-gray-900 dark:text-gray-100 font-bold">${item.quantity * item.price}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              <DashboardPagination 
                page={page} 
                maxPage={maxPage} 
                setPage={setPage} 
              />
            </>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
              onClick={() => setPreviewImage(null)}
            >
              <div className="relative max-w-4xl w-full">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                />
                <button className="absolute -top-10 right-0 text-white font-bold text-xl hover:text-gray-300 transition-colors">Close ×</button>
              </div>
            </div>
          )}

          {/* Delete confirmation remains same but polished if needed */}
          {deleteConfirm.open && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Order?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Are you sure you want to permanently remove this order? This action cannot be undone.</p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmDelete}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                      Delete Order
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ open: false, id: null })}
                      className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Orders;
