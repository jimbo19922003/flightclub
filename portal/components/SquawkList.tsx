"use client";

import { resolveSquawk } from "@/app/actions/squawks";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SquawkList({ squawks }: { squawks: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleResolve = async (id: string) => {
        setLoadingId(id);
        await resolveSquawk(id);
        setLoadingId(null);
    };

    if (squawks.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-gray-500">No open squawks reported.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {squawks.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-red-500 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <h4 className="font-bold text-gray-900">Reported by {log.user.name}</h4>
                            <span className="text-xs text-gray-500">
                                {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 mt-1">{log.notes}</p>
                    </div>
                    <button 
                        onClick={() => handleResolve(log.id)}
                        disabled={loadingId === log.id}
                        className="bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                        {loadingId === log.id ? "Resolving..." : "Mark Resolved"}
                    </button>
                </div>
            ))}
        </div>
    );
}
