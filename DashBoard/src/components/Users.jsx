import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.jpg";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { deleteAllUsers, fetchAllUsers } from "../store/slices/adminSlice";
const Users = () => {
  const [page, setPage] = useState(1);
  const { loading, users, totalUsers } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const [maxPage, setMaxPage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (totalUsers !== undefined) {
      const newMax = Math.ceil(totalUsers / 10);
      setMaxPage(newMax || 1);
    }
  }, [totalUsers]);

  useEffect(() => {
    if (maxPage && page > maxPage) {
      setPage(maxPage);
    }
  }, [maxPage, page]);

  const handleDeleteUser = (id) => {
    // if (totalUsers === 11) {
    //   setMaxPage(1);
    // }
    dispatch(deleteAllUsers(id, page));
  };

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        {/* Header */}
        <div className="flex-1 md:p-6">
          <Header />
          <h1 className="text-2xl font-bold">All Users</h1>
          <p className="text-sm text-gray-600 mb-6">
            Manage Your website's all users.
          </p>
          <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <div
              className={`overflow-x-auto rounded-lg ${
                loading
                  ? "p-10 shadow-none"
                  : users && users.length > 0
                    ? "shadow-lg"
                    : ""
              }`}
            >
              {loading ? (
                <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : users && users.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Avatar</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Registered On</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      return (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <img
                              src={user?.avatar?.url || avatar}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </td>
                          <td className="px-3 py-4">{user.name}</td>
                          <td className="px-3 py-4">{user.email}</td>
                          <td className="px-3 py-4">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <h3 className="text-2xl font-bold p-6">No users found.</h3>
              )}
            </div>

            {/* Pagination */}
            {!loading && users.length > 0 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">Page {page}</span>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                  disabled={maxPage === page}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Users;
