'use client';

import Link from 'next/link';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
        
        <div className="space-y-8 text-gray-600 dark:text-gray-300">
          {/* Acceptance of Terms */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p className="mb-4">
              Welcome to Ethiobrains! By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          {/* Description of Services */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Description of Services</h2>
            <p className="mb-4">
              Ethiobrains provides educational tools and services including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Text and document summarization</li>
              <li>Detailed explanations of complex topics</li>
              <li>Automated quiz generation</li>
              <li>Flashcard creation and management</li>
              <li>Study progress tracking</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Eligibility</h2>
            <p className="mb-4">
              To use Ethiobrains, you must be:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>At least 13 years of age</li>
              <li>If under 18, supervised by a parent or legal guardian who agrees to be bound by these terms</li>
              <li>Capable of forming a legally binding contract</li>
              <li>Not prohibited from using our services under applicable laws</li>
            </ul>
          </section>

          {/* Account Creation and Security */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Account Creation and Security</h2>
            <p className="mb-4">
              When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Keep your password secure and confidential</li>
              <li>Update your account information as needed</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. User Responsibilities</h2>
            <p className="mb-4">
              As a user of Ethiobrains, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Use the service for legitimate educational purposes only</li>
              <li>Not share copyrighted material without permission</li>
              <li>Not misuse or attempt to disrupt our services</li>
              <li>Not share account access with others</li>
              <li>Report any security issues you discover</li>
            </ul>
          </section>

          {/* Service Limitations */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Service Limitations and Disclaimers</h2>
            <p className="mb-4">
              Please be aware that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Our AI-generated content should be used as a study aid, not as the sole source of information</li>
              <li>We may experience occasional service interruptions for maintenance</li>
              <li>We reserve the right to modify or discontinue services with reasonable notice</li>
              <li>Services are provided "as is" without warranties of any kind</li>
            </ul>
          </section>

          {/* Privacy and Data */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Privacy and Data Protection</h2>
            <p className="mb-4">
              We are committed to protecting your privacy. Our data practices include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Collecting only necessary information for service provision</li>
              <li>Using industry-standard security measures</li>
              <li>Never selling personal information to third parties</li>
              <li>Allowing users to request their data or deletion of their account</li>
            </ul>
            <p>
              For complete details, please review our{' '}
              <Link href="/privacy" className="text-green-500 hover:text-green-600 dark:text-green-400">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">8. Limitation of Liability</h2>
            <p className="mb-4">
              Ethiobrains and its team shall not be liable for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Indirect or consequential damages</li>
              <li>Loss of data or study materials</li>
              <li>Service interruptions or technical issues</li>
              <li>Accuracy of AI-generated content</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">9. Governing Law</h2>
            <p className="mb-4">
              These terms are governed by the laws of Ethiopia. Any disputes shall be resolved in the courts of Addis Ababa, Ethiopia.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">10. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Email: support@ethiobrains.com</li>
              <li>Address: Addis Ababa, Ethiopia</li>
            </ul>
          </section>

          {/* Last Updated */}
          <section className="text-sm text-gray-500 dark:text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 