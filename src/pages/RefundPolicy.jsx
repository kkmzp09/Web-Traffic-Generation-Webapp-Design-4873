import React from 'react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. General Policy</h2>
            <p>Due to the nature of digital services, all purchases made on OrganiTraffic are generally <strong>non-refundable</strong>. By purchasing a subscription or service, you acknowledge and agree to this policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Payment Processing</h2>
            <p className="mb-3">All payments are processed through secure payment gateways. Please note:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payments are processed through RBI-compliant payment gateways</li>
              <li>Once a payment is confirmed, it is processed immediately</li>
              <li>You are responsible for ensuring payment accuracy before confirming</li>
              <li>All transactions are secure and encrypted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Subscription Cancellations</h2>
            <p className="mb-3">You may cancel your subscription at any time:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>You will retain access to paid features until the end of the billing period</li>
              <li>No refunds will be provided for the remaining time in your billing period</li>
              <li>After cancellation, your account will revert to the Free plan</li>
              <li>You can reactivate your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Exceptions</h2>
            <p className="mb-3">Refunds may be considered in the following exceptional circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Technical Issues:</strong> If our service is unavailable for an extended period due to technical problems on our end</li>
              <li><strong>Duplicate Charges:</strong> If you were accidentally charged multiple times for the same subscription</li>
              <li><strong>Service Not Delivered:</strong> If you paid for a service but did not receive access due to our error</li>
              <li><strong>Billing Errors:</strong> If there was a clear error in the billing amount</li>
            </ul>
            <p className="mt-3">All refund requests must be submitted within <strong>7 days</strong> of the transaction and will be reviewed on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. How to Request a Refund</h2>
            <p className="mb-3">If you believe you qualify for a refund under our exception policy:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team at <strong>support@organitrafficboost.com</strong></li>
              <li>Include your transaction ID and payment details</li>
              <li>Provide a detailed explanation of why you're requesting a refund</li>
              <li>Include any relevant screenshots or documentation</li>
            </ol>
            <p className="mt-3">We will review your request and respond within 5-7 business days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Refund Processing</h2>
            <p className="mb-3">If your refund request is approved:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds will be processed to your original payment method</li>
              <li>Refund processing may take 7-14 business days</li>
              <li>You are responsible for providing valid bank account details</li>
              <li>Processing fees may be deducted from the refund amount</li>
              <li>Refunds are subject to bank processing times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Chargebacks</h2>
            <p>Any payment disputes must be resolved directly with OrganiTraffic through our support channels before initiating chargebacks with your bank or payment provider.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Free Trial</h2>
            <p>We offer a Free plan with limited features so you can evaluate our service before purchasing a paid subscription. We encourage you to use the Free plan to ensure our service meets your needs.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Service Modifications</h2>
            <p>If we make significant changes to our service that materially reduce functionality, existing subscribers will be notified and may be eligible for a prorated refund if they cancel within 30 days of the change notification.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Account Termination</h2>
            <p className="mb-3">If we terminate your account for violation of our Terms of Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No refunds will be provided</li>
              <li>You forfeit access to all paid features immediately</li>
              <li>Any remaining subscription time is forfeited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="mb-3">For questions about our Refund Policy or to request a refund:</p>
            <ul className="list-none space-y-2">
              <li>Email: support@organitrafficboost.com</li>
              <li>Subject Line: "Refund Request - [Your Transaction ID]"</li>
              <li>Website: <Link to="/" className="text-blue-600 hover:underline">https://organitrafficboost.com</Link></li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> By making a purchase, you acknowledge that you have read, understood, and agree to this Refund Policy. Please review carefully before completing any transaction.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
