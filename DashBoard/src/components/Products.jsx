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

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [maxPage, setMaxPage] = useState(null);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const {
    isViewProductModalOpened,
    isCreateProductModalOpened,
    isUpdateProductModalOpened,
  } = useSelector((state) => state.extra);

  const { loading, products, totalProducts, fetchingProducts } = useSelector(
    (state) => state.product,
  );

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

          <div className="p-4 sm:p-8 bg-gray-50 dark:bg-[#0f1115] min-h-screen transition-colors">
            <div
              className={`overflow-x-auto rounded-lg ${
                fetchingProducts
                  ? "p-10 shadow-none"
                  : products && products.length > 0
                    ? "shadow-lg"
                    : ""
              }`}
            >
              {fetchingProducts ? (
                <table className="min-w-[800px] w-full bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800">
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
              ) : products && products?.length > 0 ? (
                <table className="min-w-[800px] w-full bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800">
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
                          onClick={() => {
                            setSelectedProduct(product);
                            dispatch(toggleViewProductModal());
                          }}
                        >
                          <td className="py-3 px-4">
                            <img
                              src={product?.images[0]?.url}
                              alt={product.name}
                              className="w-12 h-12 rounded-md object-cover border border-gray-100"
                            />
                          </td>
                          <td className="px-3 py-4 max-w-[200px] sm:max-w-[400px]">
                            <p className="truncate font-medium text-gray-900 dark:text-gray-200" title={product.name}>
                              {product.name}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                          <td className="px-3 py-4 font-semibold text-primary">
                            ${product.price}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                  dispatch(toggleUpdateProductModal());
                                }}
                              >
                                Update
                              </button>
                              <button
                                className="text-white rounded-md cursor-pointer px-3 py-1.5 text-sm font-semibold bg-red-gradient flex gap-2 items-center hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                  dispatch(deleteProduct(product.id, page));
                                }}
                              >
                                {selectedProduct?.id === product.id && loading ? (
                                  <>
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <h3 className="text-2xl font-bold p-6">No products found.</h3>
              )}
            </div>

            {/* Pagination */}
            {!fetchingProducts && products?.length > 0 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-6 py-2 bg-white dark:bg-[#1a1c23] border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium shadow-sm dark:text-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 bg-white dark:bg-[#1a1c23] border border-gray-300 dark:border-gray-800 rounded-lg font-bold text-primary shadow-sm">
                  Page {page}
                </div>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-6 py-2 bg-white dark:bg-[#1a1c23] border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium shadow-sm dark:text-gray-200 disabled:opacity-50"
                  disabled={maxPage === page}
                >
                  Next
                </button>
              </div>
            )}
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
    </>
  );
};

export default Products;
