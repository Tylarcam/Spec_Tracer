import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Privacy Policy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            SpecTrace Privacy Policy
          </h1>
          <p className="text-xl text-slate-300">
            Effective Date: 07/28/2025
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700 prose prose-invert max-w-none">
          <div className="space-y-8 text-slate-300 leading-relaxed">
            <p>
              SpecTrace ("we", "our", or "us") values your privacy. This Privacy Policy describes what information we collect through our Chrome Extension and how we use, protect, and disclose that information.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. What Information We Collect</h2>
              <p className="mb-4">
                We only collect limited technical and user-initiated information to power core functionality. We do not collect or store any personal communications, browsing history, location, or device-level activity.
              </p>
              <p className="mb-2"><strong className="text-cyan-400">We collect:</strong></p>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Financial and Payment Information</h4>
                  <p>
                    When you purchase SpecTrace Pro (via a third-party service such as Stripe or Gumroad), we may process payment data. We do not store this information; it is handled securely by the payment processor.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Authentication Information (only if you log in)</h4>
                  <p>
                    If you choose to authenticate (e.g. to access saved traces or settings), we collect minimal credentials through a secure third-party provider (e.g., Supabase Auth or Firebase Auth). This may include email address and access tokens.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. What We Don't Collect</h2>
              <p className="mb-2">We do not collect or access the following:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Personally identifiable information (unless provided voluntarily for login)</li>
                <li>Health information</li>
                <li>Personal communications (emails, messages, calls)</li>
                <li>Web history (no tracking of page visits or URLs)</li>
                <li>User activity like mouse movements or keystrokes</li>
                <li>Website content, images, videos, or text beyond captured UI element metadata</li>
                <li>Location or IP-based geodata</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. How We Use Your Data</h2>
              <p className="mb-2">We use data strictly for the following purposes:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>To enable in-browser functionality like saving your recent traces, token usage, and settings</li>
                <li>To fulfill transactions (if purchasing Pro)</li>
                <li>To personalize features if logged in</li>
                <li>To ensure compatibility and diagnose extension performance issues</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Data Storage & Retention</h2>
              <p className="mb-2">All UI data captured via SpecTrace is:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Stored locally in your browser, unless explicitly exported by you</li>
                <li>Never sent to any server unless initiated (e.g. for AI review via an integration)</li>
                <li>Erased upon browser storage clearing or uninstall</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Data Sharing & Transfers</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>We do not sell, rent, or transfer user data to any third party.</li>
                <li>We only use third-party services that comply with strict privacy and security practices.</li>
                <li>We never use your data for creditworthiness, profiling, or advertising.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Your Choices</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>You can use SpecTrace without signing in.</li>
                <li>You may clear all locally stored data anytime by resetting the extension or clearing browser data.</li>
                <li>You may revoke permissions or uninstall the extension at any time.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. If we make significant changes, we'll notify users via the extension or update the effective date above.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Contact Us</h2>
              <p className="mb-2">If you have questions about this Privacy Policy or your data, contact us at:</p>
                              <p className="text-cyan-400">📧 support@nobrainerco.com</p>
            </div>

            <div className="bg-slate-700/50 p-6 rounded-lg border border-green-500/30">
              <h2 className="text-2xl font-bold text-green-400 mb-4">✔️ Developer Disclosure Certification</h2>
              <p className="mb-2">By publishing this extension, we certify that:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>We do not sell or transfer user data to third parties (outside approved use cases)</li>
                <li>We do not use data for unrelated purposes</li>
                <li>We do not use data for lending, creditworthiness, or profiling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;