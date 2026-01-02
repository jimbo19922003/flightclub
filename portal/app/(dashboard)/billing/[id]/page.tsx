import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import PaymentButton from "@/components/PaymentButton";

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { 
        user: true, 
        items: true 
    }
  });

  if (!invoice) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Invoice #{invoice.id.slice(-6)}</h1>
                <span className={`px-2 py-1 text-xs font-bold rounded-full 
                    ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                      invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {invoice.status}
                </span>
            </div>
            <p className="text-gray-500 mt-1">Issued to {invoice.user.name}</p>
         </div>
         <Link href="/billing" className="text-gray-600 hover:text-gray-900">
            Back to Billing
         </Link>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-8 py-6 border-b bg-gray-50 flex justify-between items-center">
              <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Due Date</p>
                  <p className="font-medium text-gray-900">{format(invoice.dueDate, 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Total Due</p>
                  <p className="text-2xl font-bold text-gray-900">${invoice.amount.toFixed(2)}</p>
              </div>
          </div>
          
          <div className="p-8">
              <h3 className="font-bold text-gray-900 mb-4">Line Items</h3>
              <table className="w-full text-sm">
                  <thead className="border-b text-gray-500">
                      <tr>
                          <th className="text-left py-2 font-medium">Description</th>
                          <th className="text-right py-2 font-medium">Qty</th>
                          <th className="text-right py-2 font-medium">Unit Price</th>
                          <th className="text-right py-2 font-medium">Amount</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y">
                      {invoice.items.map((item) => (
                          <tr key={item.id}>
                              <td className="py-3 text-gray-900">{item.description}</td>
                              <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                              <td className="py-3 text-right text-gray-500">${item.unitPrice.toFixed(2)}</td>
                              <td className="py-3 text-right font-medium text-gray-900">${item.amount.toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
                  <tfoot className="border-t">
                      <tr>
                          <td colSpan={3} className="pt-4 text-right font-bold text-gray-900">Total</td>
                          <td className="pt-4 text-right font-bold text-gray-900 text-lg">${invoice.amount.toFixed(2)}</td>
                      </tr>
                  </tfoot>
              </table>
          </div>

          <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4 border-t">
              {invoice.status !== 'PAID' ? (
                  <PaymentButton invoiceId={invoice.id} amount={invoice.amount} />
              ) : (
                  <div className="flex items-center text-green-700 font-bold bg-green-50 px-4 py-2 rounded-md border border-green-200">
                      PAID ON {invoice.paidAt ? format(invoice.paidAt, 'MMM d, yyyy') : 'Unknown Date'}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
