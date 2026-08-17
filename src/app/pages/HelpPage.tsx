import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';

export const HelpPage: React.FC = () => {
  const { setRoute, setShowAskNaviModal, setTourStep, updateState, addToast } = useSandbox();
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'Where do I find my Sandbox API credentials?',
      a: 'Go to Developer > API Keys in the sidebar. You will find your Public Key, Secret Key, and Merchant ID ready for testing.',
    },
    {
      q: 'Does the Sandbox require real bank accounts or money?',
      a: 'No. PayWay Sandbox is a completely simulated environment. No actual money moves, and test card numbers or KHQR codes are safe to test.',
    },
    {
      q: 'How do I test KHQR payments on mobile devices?',
      a: 'Go to Integrations > KHQR API > Interactive QR Testing tab. Generate a QR code string and click "Simulate Customer Scan & Payment".',
    },
    {
      q: 'What should I do when ready for Production?',
      a: 'Complete at least 5 test transactions in Sandbox, configure your webhook URL in Developer Settings, and then submit your business KYC details for live approval.',
    },
  ];

  const filteredFaqs = faqs.filter(
    item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageHeader
        title="Help &amp; Developer Documentation"
        description="Find setup guides, answers to common integration questions, and developer support resources."
        actions={
          <button
            onClick={() => setShowAskNaviModal(true)}
            className="flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' }}
          >
            ✦ Ask Navi AI Assistant
          </button>
        }
      />

      {/* Search Input */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="relative">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-3"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search help topics, error codes, KHQR setup..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFaqs.map((faq, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle
                icon={
                  <svg width="15" height="15" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
              >
                {faq.q}
              </CardTitle>
              <CardDescription>{faq.a}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Onboarding & Guided Tour Card */}
      <Card className="bg-gradient-to-r from-cyan-50/60 via-white to-teal-50/40 border-cyan-100">
        <CardHeader>
          <CardTitle>Sandbox Onboarding &amp; Guided Tour</CardTitle>
          <CardDescription>Revisit the first-time tour or un-dismiss your floating Setup Guide</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setRoute('/home');
              setTourStep(1);
              addToast('Guided Tour Started', 'Launching Developer Home tour', 'info');
            }}
            className="px-4 py-2 bg-[#00B4CC] hover:bg-[#0A9BB0] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Restart Guided Tour →
          </button>
          <button
            onClick={() => {
              updateState({ setupGuideDismissed: false });
              addToast('Setup Guide Restored', 'Floating Setup Guide is now visible in the bottom right', 'success');
            }}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Re-open Floating Setup Guide
          </button>
        </CardContent>
      </Card>

      {/* Contact & Support Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Need direct assistance?</CardTitle>
          <CardDescription>Reach ABA PayWay Merchant Integration Support</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 text-xs">
          <div className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1">
            <span className="font-semibold text-gray-800">Developer Support Email</span>
            <span className="text-cyan-700 font-mono">payway_support@ababank.com</span>
            <span className="text-[11px] text-gray-400">Response time: &lt; 24 business hours</span>
          </div>
          <div className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1">
            <span className="font-semibold text-gray-800">PayWay Hotline</span>
            <span className="text-cyan-700 font-mono">+855 (0) 23 225 333</span>
            <span className="text-[11px] text-gray-400">Monday – Sunday (24/7 Support)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
