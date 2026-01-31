"use client";

import { useState, useEffect, useCallback } from "react";
import { getTierName } from "@/lib/solved-ac";
import {
    getUsers,
    deleteUser,
    updateUser,
    syncUserFromSolvedAc,
} from "../actions";

interface User {
    id: string;
    name: string;
    ssafyId: string;
    bojHandle: string;
    campus: string;
    classNum: number;
    tier: number;
    solvedCount: number;
    totalPoint: number;
    lastUpdatedAt: Date | string | null;
    createdAt: Date | string;
}

const CAMPUSES = ["서울", "대전", "구미", "광주", "부울경"];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [campus, setCampus] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Edit modal state
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        campus: "",
        classNum: 1,
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getUsers({ page, search, campus });
        if (result.success && result.users) {
            setUsers(result.users as User[]);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 1);
        }
        setLoading(false);
    }, [page, search, campus]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}?`)) {
            return;
        }

        setActionLoading(userId);
        const result = await deleteUser(userId);
        if (result.success) {
            fetchUsers();
        } else {
            alert(result.error);
        }
        setActionLoading(null);
    };

    const handleSync = async (userId: string) => {
        setActionLoading(userId);
        const result = await syncUserFromSolvedAc(userId);
        if (result.success) {
            fetchUsers();
        } else {
            alert(result.error);
        }
        setActionLoading(null);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            campus: user.campus,
            classNum: user.classNum,
        });
    };

    const handleUpdate = async () => {
        if (!editingUser) return;

        setActionLoading(editingUser.id);
        const result = await updateUser(editingUser.id, editForm);
        if (result.success) {
            setEditingUser(null);
            fetchUsers();
        } else {
            alert(result.error);
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <span className="text-sm text-gray-500">Total: {total} users</span>
            </div>

            {/* Search and Filter */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search by name, SSAFY ID, or BOJ handle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={campus}
                    onChange={(e) => {
                        setCampus(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Campuses</option>
                    {CAMPUSES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Search
                </button>
            </form>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                SSAFY ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                BOJ Handle
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Campus/Class
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tier
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Points
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {user.ssafyId}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {user.bojHandle}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {user.campus} {user.classNum}반
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {getTierName(user.tier)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {user.totalPoint.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                disabled={actionLoading === user.id}
                                                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleSync(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="px-2 py-1 text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                                            >
                                                {actionLoading === user.id ? "..." : "Sync"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                disabled={actionLoading === user.id}
                                                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Campus
                                </label>
                                <select
                                    value={editForm.campus}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, campus: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {CAMPUSES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class Number
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={editForm.classNum}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            classNum: parseInt(e.target.value) || 1,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={actionLoading === editingUser.id}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading === editingUser.id ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
