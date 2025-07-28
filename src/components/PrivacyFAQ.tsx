import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Lock, Eye } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: "Does SpecTracer collect or store my data?",
    answer: "No. SpecTracer operates entirely in your browser. We don't collect, store, or transmit any personal information, browsing history, or page content. All processing happens locally on your device.",
    icon: <Shield className="h-5 w-5 text-green-400" />
  },
  {
    question: "Why does the extension need host permissions?",
    answer: "Host permissions are required for DOM inspection during active debugging sessions only. The extension only accesses page content when you explicitly activate debugging mode. No background monitoring occurs.",
    icon: <Eye className="h-5 w-5 text-cyan-400" />
  },
  {
    question: "What happens to my data when debugging ends?",
    answer: "All debugging data is immediately cleared when you stop debugging. No information is cached, stored, or transmitted. Your privacy is protected at all times.",
    icon: <Lock className="h-5 w-5 text-blue-400" />
  },
  {
    question: "How is SpecTracer different from other debugging tools?",
    answer: "SpecTracer is privacy-first by design. Unlike many tools that collect usage data, we process everything locally in your browser. You control what gets shared with AI assistants.",
    icon: <Zap className="h-5 w-5 text-purple-400" />
  },
  {
    question: "Can I use SpecTracer without the extension?",
    answer: "Yes! Try our interactive demo now. The extension will be available for direct download for enhanced functionality.",
    icon: <Shield className="h-5 w-5 text-green-400" />
  }
];

const PrivacyFAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 px-4 bg-slate-800/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Privacy & Security FAQ</h2>
          <p className="text-xl text-slate-300">
            Your privacy is our priority. Here's how we protect your data.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-lg font-semibold text-white">
                    {item.question}
                  </span>
                </div>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-green-400" />
              <span className="text-green-400 font-semibold text-lg">Privacy-First Guarantee</span>
            </div>
            <p className="text-slate-300">
              We're committed to zero data collection. All processing happens locally in your browser. 
              No analytics, no tracking, no data transmission.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyFAQ; 