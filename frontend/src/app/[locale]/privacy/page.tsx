import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="p-10 max-w-3xl mx-auto text-sm leading-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
       ← Back to Home
      </Link>

      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-4">
        Last updated: April 11, 2026
      </p>

      <p className="mb-4">
        This Privacy Policy explains how we collect, use, and protect your information when you use our service.
      </p>

      <h2 className="font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p>
        When you use this service, we may collect the following information:
      </p>
      <ul className="list-disc ml-5">
        <li>Account information (username and email address)</li>
        <li>Habit data and daily records you create</li>
      </ul>

      <h2 className="font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <p>
        Your information is used solely to provide and improve the service.
        We do not use your data for advertising, marketing, or any unrelated purposes.      
      </p>

      <h2 className="font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <p>
        We do not sell, trade, or share your personal data with third parties.
      </p>

      <h2 className="font-semibold mt-6 mb-2">4. Data Storage and Security</h2>
      <p>
        Your data is stored securely and is only accessible to your account.
        Reasonable measures are taken to protect your information from unauthorized access.
      </p>

      <h2 className="font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p>
        You may request deletion of your account and associated data at any time.
      </p>

      <h2 className="font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Continued use of the service means you accept the updated policy.
      </p>

      <h2 className="font-semibold mt-6 mb-2">7. Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us.
      </p>
    </div>
  )
}