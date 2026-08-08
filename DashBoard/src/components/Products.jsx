import React, { useState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { TableRowSkeleton } from "./Skeleton";
import CreateProductModal from "../modals/CreateProductModal";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import {
  toggleCreateProductModal,
  toggleUpdateProductModal,
  toggleViewProductModal,
} from "../store/slices/extraSlice";
import { deleteProduct, fetchAllProducts } from "../store/slices/productsSlice";
import DashboardPagination from "./common/DashboardPagination";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [maxPage, setMaxPage] = useState(null);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useDispatch();
  const {
    isViewProductModalOpened,
    isCreateProductModalOpened,
    isUpdateProductModalOpened,
  } = useSelector((state) => state.extra);

  const { loading, products, totalProducts, fetchingProducts } = useSelector(
    (state) => state.product,
  );

  const confirmDelete = async () => {
    if (!deleteConfirm.product) return;
    setIsDeleting(true);
    await dispatch(deleteProduct(deleteConfirm.product.id, page));
    setIsDeleting(false);
    setDeleteConfirm({ open: false, product: null });
  };

  useEffect(() => {
    // Fetch All Products
    dispatch(fetchAllProducts(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (totalProducts !== undefined) {
      const newMax = Math.ceil(totalProducts / 10);
      setMaxPage(newMax);
    }
  }, [totalProducts]);

  useEffect(() => {
    if (maxPage && page > maxPage) {
      setPage(maxPage);
    }
  }, [maxPage, page]);

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        {/* <h1 className="text-red-600 text-3xl">PRODUCTS PAGE</h1> */}
        <div className="flex-1 md:p-6">
          <Header />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 italic tracking-tight">All Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage Your products.</p>

          <div className="space-y-6">
            {fetchingProducts ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1c23]">
                <table className="min-w-[800px] w-full">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">Image</th>
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Category</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Stock</th>
                      <th className="py-3 px-4 text-left">Ratings</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <TableRowSkeleton key={n} columns={7} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : products && products?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1c23]">
                <table className="min-w-[800px] w-full">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/40 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">Image</th>
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Category</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Stock</th>
                      <th className="py-3 px-4 text-left">Ratings</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      return (
                        <tr
                          key={index}
                          className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div
                              className="relative group w-12 h-12 cursor-pointer"
                              title="Click to view product details"
                              onClick={() => {
                                setSelectedProduct(product);
                                dispatch(toggleViewProductModal());
                              }}
                            >
                              <img
                                src={product?.images[0]?.url}
                                alt={product.name}
                                className="w-12 h-12 rounded-md object-cover border border-gray-100 dark:border-gray-800 group-hover:opacity-70 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 max-w-[200px] sm:max-w-[400px]">
                            <p className="truncate font-medium text-gray-900 dark:text-gray-200" title={product.name}>
                              {product.name}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                          <td className="px-3 py-4 font-semibold text-primary">
                            ₹{product.price}
                          </td>
                          <td className="px-3 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100/10 text-green-500' : 'bg-red-100/10 text-red-500'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-yellow-500">
                            {product.ratings} ★
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                className="text-white rounded-md cursor-pointer px-3 py-1.5 text-sm font-semibold bg-blue-gradient hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  dispatch(toggleUpdateProductModal());
                                }}
                              >
                                Update
                              </button>
                              <button
                                className="text-white rounded-md cursor-pointer px-3 py-1.5 text-sm font-semibold bg-red-gradient flex gap-2 items-center hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  setDeleteConfirm({ open: true, product });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white dark:bg-[#1a1c23] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No products found.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click the '+' button at the bottom right to add your first product.</p>
              </div>
            )}

            {/* Pagination */}
            <DashboardPagination 
              page={page} 
              maxPage={maxPage} 
              setPage={setPage} 
            />
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleCreateProductModal())}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300"
          title="create New Product"
        >
          <Plus size={20} />
        </button>
      </main>
      {isCreateProductModalOpened && <CreateProductModal />}
      {isUpdateProductModalOpened && (
        <UpdateProductModal selectedProduct={selectedProduct} />
      )}
      {isViewProductModalOpened && (
        <ViewProductModal selectedProduct={selectedProduct} />
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Product?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">"{deleteConfirm.product?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting Product...</span>
                  </>
                ) : (
                  "Delete Product"
                )}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => setDeleteConfirm({ open: false, product: null })}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Keep Product
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
