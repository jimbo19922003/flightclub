"use client";

import { deleteMembershipTier } from "@/app/actions/settings";
import { Trash2 } from "lucide-react";

export function DeleteTierButton({ id }: { id: string }) {
    return (
        <button 
            onClick={() => deleteMembershipTier(id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Tier"
        >
            <Trash2 size={18} />
        </button>
    )
}
