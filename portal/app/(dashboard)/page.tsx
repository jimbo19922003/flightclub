import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AircraftStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const aircraftCount = await prisma.aircraft.count();
    const memberCount = await prisma.user.count({ where: { role: 'MEMBER' } });
    const upcomingReservations = await prisma.reservation.count({
        where: {
        startTime: {
            gte: new Date(),
        },
        },
    });
    return { aircraftCount, memberCount, upcomingReservations };
  } catch (e) {
    console.error("Database connection failed", e);
    return { aircraftCount: 0, memberCount: 0, upcomingReservations: 0 };
  }
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 bg-white">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Total Aircraft</h3>
            <div className="text-2xl font-bold">{stats.aircraftCount}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 bg-white">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Active Members</h3>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 bg-white">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Upcoming Reservations</h3>
            <div className="text-2xl font-bold">{stats.upcomingReservations}</div>
        </div>
      </div>
      
      {/* Add more widgets here */}
    </div>
  );
}
