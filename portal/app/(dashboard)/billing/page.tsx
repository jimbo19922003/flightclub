import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { generateMonthlyInvoices } from "@/app/actions/billing";

export const dynamic = 'force-dynamic';

async function getBillingStats() {
    try {
        // In a real app, filter by current user if not admin
        const invoices = await prisma.invoice.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return invoices;
    } catch (error) {
        console.error("Failed to fetch billing stats:", error);
        return [];
    }
}

export default async function BillingPage() {
    const invoices = await getBillingStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
                <form action={generateMonthlyInvoices}>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Generate Monthly Invoices
                    </button>
                </form>
            </div>
            
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{invoice.id.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.user.name || invoice.user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(invoice.createdAt, 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {invoices.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No invoices found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
