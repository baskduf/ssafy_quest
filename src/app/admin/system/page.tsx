"use client";

import { useState } from "react";
import {
    syncAllUsers,
    updateRanks,
    fetchDailyProblems,
    resetSeason,
} from "../actions";

interface TaskResult {
    success: boolean;
    message?: string;
    error?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export default function SystemPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, TaskResult>>({});
    const [showSeasonConfirm, setShowSeasonConfirm] = useState(false);

    const runTask = async (
        taskName: string,
        taskFn: () => Promise<TaskResult>
    ) => {
        setLoading(taskName);
        try {
            const result = await taskFn();
            setResults((prev) => ({ ...prev, [taskName]: result }));
        } catch (error) {
            setResults((prev) => ({
                ...prev,
                [taskName]: { success: false, error: String(error) },
            }));
        }
        setLoading(null);
    };

    const handleSeasonReset = async () => {
        setShowSeasonConfirm(false);
        await runTask("resetSeason", resetSeason);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Management</h2>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sync All Users */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sync All Users
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Update all users&apos; data from Solved.ac. This may take a while
                        depending on the number of users.
                    </p>
                    <button
                        onClick={() => runTask("syncAllUsers", syncAllUsers)}
                        disabled={loading !== null}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading === "syncAllUsers" ? "Syncing..." : "Sync All Users"}
                    </button>
                    {results.syncAllUsers && (
                        <div
                            className={`mt-3 p-3 rounded-lg text-sm ${
                                results.syncAllUsers.success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {results.syncAllUsers.success
                                ? `Success: ${results.syncAllUsers.successCount} synced, ${results.syncAllUsers.failedCount} failed`
                                : `Error: ${results.syncAllUsers.error}`}
                        </div>
                    )}
                </div>

                {/* Update Ranks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Update Ranks
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Recalculate and update the ranking for all users based on their
                        current points.
                    </p>
                    <button
                        onClick={() => runTask("updateRanks", updateRanks)}
                        disabled={loading !== null}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading === "updateRanks" ? "Updating..." : "Update Ranks"}
                    </button>
                    {results.updateRanks && (
                        <div
                            className={`mt-3 p-3 rounded-lg text-sm ${
                                results.updateRanks.success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {results.updateRanks.success
                                ? `Updated ${results.updateRanks.updatedCount} users at ${new Date(results.updateRanks.updatedAt).toLocaleString("ko-KR")}`
                                : `Error: ${results.updateRanks.error}`}
                        </div>
                    )}
                </div>

                {/* Fetch Daily Problems */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Fetch Daily Problems
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Fetch new random problems from Solved.ac for the daily problem
                        section.
                    </p>
                    <button
                        onClick={() => runTask("fetchDailyProblems", fetchDailyProblems)}
                        disabled={loading !== null}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading === "fetchDailyProblems"
                            ? "Fetching..."
                            : "Fetch Daily Problems"}
                    </button>
                    {results.fetchDailyProblems && (
                        <div
                            className={`mt-3 p-3 rounded-lg text-sm ${
                                results.fetchDailyProblems.success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {results.fetchDailyProblems.success
                                ? `Fetched ${results.fetchDailyProblems.count} problems (ID: ${results.fetchDailyProblems.id})`
                                : `Error: ${results.fetchDailyProblems.error}`}
                        </div>
                    )}
                </div>

                {/* Season Reset */}
                <div className="bg-white rounded-lg border border-red-200 p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Season Reset
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        <span className="text-red-600 font-medium">Warning:</span> This
                        will archive current season stats and reset all user scores to 0.
                        Use with caution!
                    </p>
                    <button
                        onClick={() => setShowSeasonConfirm(true)}
                        disabled={loading !== null}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading === "resetSeason" ? "Resetting..." : "Reset Season"}
                    </button>
                    {results.resetSeason && (
                        <div
                            className={`mt-3 p-3 rounded-lg text-sm ${
                                results.resetSeason.success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {results.resetSeason.success
                                ? `Season "${results.resetSeason.seasonName}" archived. ${results.resetSeason.updatedCount} users reset, ${results.resetSeason.historyCreated} history records created.`
                                : `Error: ${results.resetSeason.error}`}
                        </div>
                    )}
                </div>
            </div>

            {/* Season Reset Confirmation Modal */}
            {showSeasonConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-red-900 mb-4">
                            Confirm Season Reset
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you absolutely sure you want to reset the season? This action
                            will:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                            <li>Archive all current user stats to season history</li>
                            <li>Reset all user points to 0</li>
                            <li>Set current stats as the new initial baseline</li>
                        </ul>
                        <p className="text-sm text-red-600 font-medium mb-6">
                            This action cannot be undone!
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSeasonConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSeasonReset}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Yes, Reset Season
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
