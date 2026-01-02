"use client";

import { createPaymentIntent } from "@/app/actions/billing";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ invoiceId, amount }: { invoiceId: string, amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the payment.
        return_url: `${window.location.origin}/billing/${invoiceId}?payment_status=success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm">{message}</div>}
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold mt-4"
      >
        {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PaymentButton({ invoiceId, amount }: { invoiceId: string, amount: number }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleStartPayment = async () => {
        try {
            const data = await createPaymentIntent(invoiceId);
            setClientSecret(data.clientSecret);
            setIsOpen(true);
        } catch (e) {
            console.error("Failed to init payment", e);
            alert("Could not initialize payment.");
        }
    };

    if (isOpen && clientSecret) {
        const options = {
            clientSecret,
            appearance: { theme: 'stripe' as const },
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Secure Payment</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm invoiceId={invoiceId} amount={amount} />
                    </Elements>
                </div>
            </div>
        );
    }

    return (
        <button 
            onClick={handleStartPayment}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold shadow-sm"
        >
            Pay Now
        </button>
    );
}
