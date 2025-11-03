import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using OrganiTraffic ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="mb-3">OrganiTraffic provides SEO analysis, website optimization tools, and related services including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Automated SEO audits and analysis</li>
              <li>Website health monitoring</li>
              <li>Keyword tracking and analytics</li>
              <li>AI-powered optimization recommendations</li>
              <li>Domain analytics and competitor analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-3">To use certain features of the Service, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Subscription Plans and Payments</h2>
            <p className="mb-3"><strong>4.1 Subscription Tiers:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Free Plan:</strong> Limited features with basic SEO scanning</li>
              <li><strong>Starter Plan:</strong> Enhanced features with monthly page limits</li>
              <li><strong>Professional Plan:</strong> Advanced features with increased limits</li>
              <li><strong>Business Plan:</strong> Full features with unlimited scanning</li>
            </ul>
            
            <p className="mb-3"><strong>4.2 Payment Terms:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed through secure payment gateways</li>
              <li>Subscriptions are billed monthly or annually as selected</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>You are responsible for all applicable taxes</li>
              <li>All transactions are processed as per RBI guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Refund Policy</h2>
            <p className="mb-3">Due to the nature of digital services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All sales are final and non-refundable</li>
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds are provided for partial months or unused services</li>
              <li>Exceptions may be made at our sole discretion for technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service excessively</li>
              <li>Resell or redistribute the Service without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Scan websites without proper authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Service Limitations</h2>
            <p className="mb-3">We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or discontinue the Service at any time</li>
              <li>Impose limits on certain features</li>
              <li>Refuse service to anyone for any reason</li>
              <li>Suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by OrganiTraffic and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>IN NO EVENT SHALL ORGANITRAFFIC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless OrganiTraffic from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Termination</h2>
            <p>We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Contact Information</h2>
            <p className="mb-3">For questions about these Terms of Service, contact us:</p>
            <ul className="list-none space-y-2">
              <li><strong>TRADE NAME:</strong> krishnakant tripathi</li>
              <li>Email: support@organitrafficboost.com</li>
              <li>Website: <Link to="/" className="text-blue-600 hover:underline">https://organitrafficboost.com</Link></li>
            </ul>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
