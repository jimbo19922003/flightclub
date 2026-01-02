import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { 
    Plane, 
    Users, 
    CalendarDays, 
    AlertTriangle, 
    CheckCircle, 
    DollarSign,
    Wrench
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
        aircraft, 
        memberCount, 
        upcomingReservations, 
        financials,
        myNextFlight
    ] = await Promise.all([
        // 1. Fleet Status
        prisma.aircraft.findMany({
            select: { id: true, registration: true, status: true, model: true }
        }),
        // 2. Member Count
        prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
        // 3. Upcoming Reservations Count
        prisma.reservation.count({
            where: { startTime: { gte: today } }
        }),
        // 4. Financials (This Month)
        prisma.invoice.aggregate({
            where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth },
                status: 'PAID'
            },
            _sum: { amount: true }
        }),
        // 5. My Next Flight (Mock user for now - usually based on session)
        prisma.reservation.findFirst({
            where: {
                startTime: { gte: today },
                // userId: session.user.id
            },
            orderBy: { startTime: 'asc' },
            include: { aircraft: true }
        })
    ]);

    return { 
        aircraft, 
        memberCount, 
        upcomingReservations, 
        monthlyRevenue: financials._sum.amount || 0,
        myNextFlight 
    };
  } catch (e) {
    console.error("Dashboard data fetch failed", e);
    return null;
  }
}

export default async function Dashboard() {
  const data = await getDashboardData();

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mission Control</h1>
        <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
      </div>
      
      {/* Top Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Fleet</p>
                    <p className="text-2xl font-bold text-gray-900">{data.aircraft.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <Plane size={20} />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">{data.memberCount}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <Users size={20} />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming Flights</p>
                    <p className="text-2xl font-bold text-gray-900">{data.upcomingReservations}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <CalendarDays size={20} />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Month Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${data.monthlyRevenue.toFixed(0)}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                    <DollarSign size={20} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Status Widget */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Fleet Status</h3>
                  <Link href="/aircraft" className="text-sm text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                  {data.aircraft.map(plane => (
                      <div key={plane.id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                          <div>
                              <p className="font-bold text-gray-900">{plane.registration}</p>
                              <p className="text-xs text-gray-500">{plane.model}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                            ${plane.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                              plane.status === 'MAINTENANCE' ? 'bg-red-100 text-red-700' : 
                              plane.status === 'IN_USE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {plane.status === 'AVAILABLE' && <CheckCircle size={12} />}
                              {plane.status === 'MAINTENANCE' && <Wrench size={12} />}
                              {plane.status === 'IN_USE' && <Plane size={12} />}
                              {plane.status}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          {/* My Next Flight Widget */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">My Next Flight</h3>
              </div>
              <div className="p-6">
                  {data.myNextFlight ? (
                      <div className="text-center space-y-4">
                          <div className="inline-block p-4 bg-blue-50 rounded-full text-blue-600">
                              <Plane size={32} />
                          </div>
                          <div>
                              <h4 className="text-xl font-bold text-gray-900">{data.myNextFlight.aircraft.registration}</h4>
                              <p className="text-gray-500">{format(data.myNextFlight.startTime, 'MMMM d, h:mm a')}</p>
                          </div>
                          <Link 
                            href={`/reservations/${data.myNextFlight.id}/checkin`}
                            className="block w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-colors"
                          >
                              Check In / View
                          </Link>
                      </div>
                  ) : (
                      <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No upcoming flights scheduled.</p>
                          <Link href="/reservations/new" className="text-blue-600 font-medium hover:underline">
                              Book a Flight
                          </Link>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
