import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {
  deleteOrder,
  fetchAllOrders,
  updateOrderstatus,
} from "../store/slices/orderSlice.js";

const Orders = () => {
  const statusArray = [
    "All",
    "Processing",
    "Shipped",
    "Delivered",
    "Cencelled",
  ];

  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  const [selectedStatus, setSelectedStatus] = useState({});
  const [filterByStatus, setFilterByStatus] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

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
    dispatch(fetchAllOrders());
    setDeleteConfirm({ open: false, id: null });
  };

  if (loading) {
    return <p className="p-10">Loading Orders....</p>;
  }

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        {/* Header */}
        <div className="flex-1 md:p-6">
          <Header />
          <h1 className="text-2xl font-bold">All Orders</h1>
          <p className="text-sm text-gray-600 mb-6">Manage all your orders.</p>
        </div>
        {/* Content */}
        {loading ? (
          <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <h3 className="text-2xl font-bold p-6">No orders found.</h3>
            ) : (
              <>
                <div className="flex justify-between items-center p-6">
                  <select
                    className="p-2 border rounded shadow-sm"
                    onChange={(e) => setFilterByStatus(e.target.value)}
                  >
                    {statusArray.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {filteredOrders?.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-all"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <p>
                            <strong>Order ID:</strong>
                            {order.id}
                          </p>
                          <p>
                            <strong>Status:</strong>
                            {order.order_status}
                          </p>
                          <p>
                            <strong>Placed At:</strong>{" "}
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                          <p>
                            <strong>Total Amount:</strong> $ {order.total_price}
                          </p>
                        </div>

                        <div>
                          <select
                            value={
                              selectedStatus[order.id] || order.order_status
                            }
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="border p-2 rounded mb-2"
                          >
                            {statusArray.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ open: true, id: order.id })
                            }
                            className="ml-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-lg mb-1">
                          Shipping Info
                        </h4>
                        <p>
                          <strong>Name:</strong>{" "}
                          {order.shipping_info?.full_name}
                        </p>
                        <p>
                          <strong>Phone:</strong> {order.shipping_info?.phone}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {order.shipping_info?.address},{" "}
                          {order.shipping_info?.city} ,
                          {order.shipping_info?.state} ,
                          {order.shipping_info?.pincode},
                        </p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-lg mb-2">
                          Ordered Items
                        </h4>
                        {Array.isArray(order.order_items) &&
                          order.order_items.map((item) => {
                            return (
                              <div
                                key={`${order.id}-${item.product_id}`}
                                className="flex items-center gap-4 mb-2 border-b pb-2"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover cursor-pointer"
                                    onClick={() => setPreviewImage(item.image)}
                                  />
                                )}
                                <div>
                                  <p className="font-semibold">{item.title}</p>
                                  <p>
                                    <strong>Qty:</strong> {item.quantity} |{" "}
                                    <strong>price:</strong> {item.price} |{" "}
                                    <strong>Total Price:</strong>{" "}
                                    {item.quantity * item.price}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Image Preview */}
            {previewImage && (
              <div
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                onClick={() => setPreviewImage(null)}
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-[90%] max-h-[90%] rounded shadow-xl"
                />
              </div>
            )}

            {/* Delete Order Confirmation Modal */}
            {deleteConfirm.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4">
                    Are you sure you want to delete this order?
                  </h3>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ open: false, id: null })
                      }
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cencel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Orders;
