import { prisma } from "@/lib/prisma";
import { updateMember } from "@/app/actions/members";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getMember(id: string) {
    try {
        const member = await prisma.user.findUnique({
            where: { id }
        });
        return member;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const member = await getMember(params.id);

  if (!member) {
      notFound();
  }

  const updateMemberWithId = updateMember.bind(null, member.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
         <Link href="/members" className="text-gray-600 hover:text-gray-900">Back to List</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={updateMemberWithId} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                    type="text" 
                    name="name" 
                    defaultValue={member.name || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                    type="email" 
                    name="email" 
                    defaultValue={member.email || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                        name="role" 
                        defaultValue={member.role}
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
                        defaultValue={member.shareSize}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>

            <div className="pt-4 border-t mt-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">Security (Admin Override)</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password (Leave blank to keep current)</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="••••••••"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div className="pt-4 flex justify-end">
                <button 
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
