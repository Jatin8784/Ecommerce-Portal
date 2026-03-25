import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.jpg";
import { TableRowSkeleton } from "./Skeleton";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { deleteAllUsers, fetchAllUsers } from "../store/slices/adminSlice";
import DashboardPagination from "./common/DashboardPagination";
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 italic tracking-tight">All Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Manage Your website's all users.
          </p>
          <div className="p-4 sm:p-8 bg-gray-50 dark:bg-[#0f1115] min-h-screen">
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
                <table className="min-w-[800px] w-full bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">Avatar</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Registered On</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <TableRowSkeleton key={n} columns={5} />
                    ))}
                  </tbody>
                </table>
              ) : users && users.length > 0 ? (
                <table className="min-w-[800px] w-full bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">Avatar</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Registered On</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      return (
                        <tr key={index} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={user?.avatar?.url || avatar}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100 dark:border-gray-800"
                            />
                          </td>
                          <td className="px-3 py-4 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                          <td className="px-3 py-4 max-w-[200px] sm:max-w-none">
                            <p className="truncate text-gray-600 dark:text-gray-400" title={user.email}>
                              {user.email}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-gray-500 dark:text-gray-500 text-sm">
                            {new Date(user.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-white rounded-md cursor-pointer px-4 py-1.5 text-sm font-semibold bg-red-gradient hover:opacity-90 transition-opacity"
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
            <DashboardPagination 
              page={page} 
              maxPage={maxPage} 
              setPage={setPage} 
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Users;
