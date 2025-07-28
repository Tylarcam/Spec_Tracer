import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Book, Bug, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Support = () => {
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
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Support</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            How can we help you?
          </h1>
          <p className="text-xl text-slate-300">
            Find answers, report issues, or get in touch with our team
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Documentation */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Book className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Documentation</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Learn how to use LogTrace with our comprehensive guides and tutorials.
            </p>
            <Link to="/debug" className="text-green-400 hover:text-green-300 font-medium inline-flex items-center gap-2">
              Try Interactive Demo
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Report Bug */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-3 rounded-lg">
                <Bug className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Report a Bug</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Found an issue? Let us know and we'll fix it quickly.
            </p>
            <a 
              href="mailto:support@logtrace.com?subject=Bug Report" 
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-2"
            >
              Send Bug Report
              <Mail className="h-4 w-4" />
            </a>
          </div>

          {/* Community */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Community</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Join our community to share tips and get help from other developers.
            </p>
            <span className="text-purple-400 font-medium">Coming Soon</span>
          </div>

          {/* Contact Us */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Contact Us</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Have questions or need personalized help? We're here for you.
            </p>
            <a 
              href="mailto:support@logtrace.com" 
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2"
            >
              Get in Touch
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-2">How does LogTrace work?</h4>
              <p className="text-slate-300">
                LogTrace captures pixel-perfect UI context from your website and formats it for AI debugging tools. 
                Simply hover over elements, click to inspect, and copy the generated context to your AI assistant.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Is LogTrace free to use?</h4>
              <p className="text-slate-300">
                Yes! LogTrace offers a free demo with 5 AI debugs included. We also have premium plans 
                for unlimited usage and additional features.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-2">When will the Chrome extension be available?</h4>
              <p className="text-slate-300">
                The Chrome extension is coming soon! Join our waitlist to get early access and be notified 
                when it's ready for download.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">Which AI tools work with LogTrace?</h4>
              <p className="text-slate-300">
                LogTrace works with any AI assistant including ChatGPT, Claude, Gemini, and more. 
                The generated context is formatted to work perfectly with all major AI debugging tools.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-300 mb-6">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              <Link to="/debug">
                Try Demo
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            >
              <a href="mailto:support@logtrace.com">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;