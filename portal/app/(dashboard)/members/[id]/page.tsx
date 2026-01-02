import { prisma } from "@/lib/prisma";
import { updateMember } from "@/app/actions/members";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

async function getMember(id: string) {
    try {
        const member = await prisma.user.findUnique({
            where: { id },
            include: {
                flightLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { aircraft: true }
                },
                reservations: {
                     orderBy: { startTime: 'asc' },
                     take: 5,
                     where: { status: 'CONFIRMED', startTime: { gt: new Date() } }, // Upcoming
                     include: { aircraft: true }
                }
            }
        });

        if (!member) return null;

        // Calculate totals
        const stats = await prisma.flightLog.aggregate({
            _sum: {
                flightTime: true,
                cost: true
            },
            where: { userId: id }
        });

        return { ...member, stats: stats._sum };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
      notFound();
  }

  const updateMemberWithId = updateMember.bind(null, member.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Member Details</h1>
         <Link href="/members" className="text-gray-600 hover:text-gray-900">Back to List</Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
          {/* Edit Form */}
          <div className="bg-white rounded-xl shadow border p-6 md:col-span-1 h-fit">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Profile</h2>
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
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <select 
                        name="status" 
                        defaultValue={member.status}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
                
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

                <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Security Override</h3>
                    <div>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="New Password..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold text-sm"
                    >
                        Save Profile
                    </button>
                </div>
            </form>
          </div>

          {/* Stats & History */}
          <div className="md:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow border">
                      <span className="block text-sm text-gray-500">Account Balance</span>
                      <span className={`text-2xl font-bold ${member.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${member.balance.toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {member.balance > 0 ? "Amount Owed" : "Credit Available"}
                      </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border">
                      <span className="block text-sm text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2
                        ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          member.status === 'PAST_DUE' ? 'bg-yellow-100 text-yellow-800' : 
                          member.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {member.status.replace('_', ' ')}
                      </span>
                  </div>
              </div>

              {/* Stats Cards (Secondary) */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow border">
                      <span className="block text-sm text-gray-500">Total Flight Time</span>
                      <span className="text-xl font-bold text-gray-900">{(member.stats?.flightTime || 0).toFixed(1)} hrs</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border">
                      <span className="block text-sm text-gray-500">Lifetime Spend</span>
                      <span className="text-xl font-bold text-gray-900">${(member.stats?.cost || 0).toFixed(2)}</span>
                  </div>
              </div>

              {/* Upcoming Reservations */}
              <div className="bg-white rounded-xl shadow border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-blue-50">
                      <h3 className="font-bold text-blue-900">Upcoming Reservations</h3>
                  </div>
                  <div className="divide-y">
                      {member.reservations.map(res => (
                          <div key={res.id} className="p-4 flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-gray-900">{res.aircraft.registration}</p>
                                  <p className="text-sm text-gray-500">{format(res.startTime, 'MMM d, h:mm a')} - {format(res.endTime, 'h:mm a')}</p>
                              </div>
                              <Link href={`/reservations/${res.id}/summary`} className="text-sm text-blue-600 hover:underline">
                                  View
                              </Link>
                          </div>
                      ))}
                      {member.reservations.length === 0 && (
                          <div className="p-4 text-center text-gray-500">No upcoming flights.</div>
                      )}
                  </div>
              </div>

              {/* Flight Logs */}
              <div className="bg-white rounded-xl shadow border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                      <h3 className="font-bold text-gray-900">Recent Flight History</h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aircraft</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {member.flightLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">{format(log.createdAt, 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{log.aircraft.registration}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.flightTime.toFixed(1)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">${log.cost.toFixed(2)}</td>
                            </tr>
                        ))}
                        {member.flightLogs.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No flight history.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      </div>
    </div>
  );
}
