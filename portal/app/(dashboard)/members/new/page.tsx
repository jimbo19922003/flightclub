import { createMember } from "@/app/actions/members";
import Link from "next/link";

export default function NewMemberPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
         <Link href="/members" className="text-gray-600 hover:text-gray-900">Cancel</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={createMember} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                    type="text" 
                    name="name" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                    type="email" 
                    name="email" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                        name="role" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="MECHANIC">Mechanic</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Share Size (0.0 - 1.0)</label>
                    <input 
                        type="number" 
                        name="shareSize" 
                        step="0.1"
                        defaultValue="1.0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                    Create Member
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
