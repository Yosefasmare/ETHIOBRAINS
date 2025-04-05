'use client';

import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <div className="space-y-8 text-gray-600 dark:text-gray-300">
          {/* Introduction */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Introduction</h2>
            <p className="mb-4">
              At Ethiobrains, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform.
            </p>
            <p className="mb-4">
              By using Ethiobrains, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Profile information you provide</li>
                  <li>Educational institution (optional)</li>
                  <li>Age or date of birth</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Study materials you upload</li>
                  <li>Learning progress and activity</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide and improve our educational services</li>
              <li>Create and maintain your account</li>
              <li>Track your learning progress</li>
              <li>Generate personalized study materials</li>
              <li>Send important updates about our service</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Data Storage and Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Secure data centers with 24/7 monitoring</li>
              <li>Limited employee access to personal information</li>
              <li>Regular backup procedures</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Data Sharing</h2>
            <p className="mb-4">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Service providers who help operate our platform</li>
              <li>Educational institutions (with your explicit consent)</li>
              <li>Law enforcement (when legally required)</li>
            </ul>
            <p className="mb-4">
              All third-party service providers are contractually obligated to protect your data.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of promotional communications</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Children's Privacy</h2>
            <p className="mb-4">
              Users under 13 years of age are not permitted to use Ethiobrains. Users between 13 and 18 must have parental consent. Parents can review their child's information and request deletion by contacting us.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">8. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve user experience</li>
            </ul>
            <p className="mb-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">9. Changes to Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. We will notify you of any significant changes via email or through our platform. Continued use of Ethiobrains after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">10. Contact Information</h2>
            <p className="mb-4">
              For privacy-related questions or concerns, please contact us at:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Email: privacy@ethiobrains.com</li>
              <li>Address: Addis Ababa, Ethiopia</li>
            </ul>
            <p className="mt-4">
              For general terms, please review our{' '}
              <Link href="/terms" className="text-green-500 hover:text-green-600 dark:text-green-400">
                Terms of Service
              </Link>
              .
            </p>
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

export default PrivacyPolicy; 