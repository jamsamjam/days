import Link from 'next/link'

export default function Terms() {
  return (
    <div className="p-10 max-w-3xl mx-auto text-sm leading-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
       ← Back to Home
      </Link>

      <h1 className="text-3xl font-semibold mb-2">Terms of Use</h1>
      <p className="text-xs text-gray-500 mb-4">
        Last updated: April 11, 2026
      </p>

      <p className="mb-4">
        By using this service, you agree to the following terms.
      </p>

      <h2 className="font-semibold mt-6 mb-2">1. Use of the Service</h2>
      <p>
        This service is provided for personal use to help users track habits.
        You agree not to misuse or disrupt the service.
      </p>

      <h2 className="font-semibold mt-6 mb-2">2. User Accounts</h2>
      <p>
        You are responsible for maintaining the security of your account and password.
        You are also responsible for all activity under your account.
      </p>

      <h2 className="font-semibold mt-6 mb-2">3. Data Responsibility</h2>
      <p>
        You are responsible for the data you create and store in the service.
        We do not guarantee recovery of lost data.
      </p>

      <h2 className="font-semibold mt-6 mb-2">4. Availability</h2>
      <p>
        The service is provided "as is" without guarantees of availability or reliability.
      </p>

      <h2 className="font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
      <p>
        We are not responsible for any damages or losses resulting from the use of this service.
      </p>

      <h2 className="font-semibold mt-6 mb-2">6. Changes to Terms</h2>
      <p>
        We may update these terms at any time. Continued use of the service means you accept the updated terms.
      </p>

      <h2 className="font-semibold mt-6 mb-2">7. Contact</h2>
      <p>
        For questions regarding these terms, please contact us.
      </p>
    </div>
  )
}