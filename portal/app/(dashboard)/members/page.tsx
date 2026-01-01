import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getMembers() {
  try {
    return await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <Link href="/members/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Member
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.shareSize}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(member.createdAt, 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No members found (or database error).</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
