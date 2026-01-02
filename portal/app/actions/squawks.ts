"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resolveSquawk(flightLogId: string) {
    // We update the flight log notes or add a maintenance log entry linked to it.
    // For now, let's mark it as resolved by prefixing the notes or moving it to a resolved status if we had one.
    // Since our schema doesn't have a dedicated "Squawk" model yet (it uses FlightLog notes),
    // we will create a maintenance log entry referencing the squawk resolution.
    
    const log = await prisma.flightLog.findUnique({
        where: { id: flightLogId },
        include: { aircraft: true }
    });

    if (!log) throw new Error("Flight log not found");

    // Create a maintenance log to document the fix
    await prisma.maintenanceLog.create({
        data: {
            aircraftId: log.aircraftId,
            title: `Resolved Squawk from ${log.aircraft.registration}`,
            description: `Resolution for issue reported on flight log: "${log.notes}"`,
            date: new Date(),
            type: 'REPAIR',
            performedBy: 'Pending Assignment', // Or current user if we had context
        }
    });

    // Optionally update the flight log to indicate it's been addressed (e.g. append to notes)
    await prisma.flightLog.update({
        where: { id: flightLogId },
        data: {
            notes: `[RESOLVED] ${log.notes}`
        }
    });

    revalidatePath(`/aircraft/${log.aircraftId}/maintenance`);
}
