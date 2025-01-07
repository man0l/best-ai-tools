'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Subscription failed');

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  const TrustpilotWidget = () => {
    useEffect(() => {
      // Wait for Trustpilot to be available
      const initTrustpilot = () => {
        if (window.Trustpilot) {
          window.Trustpilot.loadFromElement(document.getElementById('trustbox'));
        } else {
          setTimeout(initTrustpilot, 100);
        }
      };

      initTrustpilot();
    }, []);

    return (
      <div
        id="trustbox"
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="6771aa4f775a7e4dc3a6b1dd"
        data-style-height="52px"
        data-style-width="100%"
        data-theme="light"
      >
        <a
          href="https://www.trustpilot.com/review/best-ai-directory.eu"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trustpilot
        </a>
      </div>
    );
  };

  return (
    <footer className="bg-secondary border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <p className="text-muted-foreground text-sm">
              Discover and explore the best AI tools to enhance your workflow and productivity.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-accent-foreground transition-colors text-sm">
                  Submit Tool
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-accent-foreground transition-colors text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-accent-foreground transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-accent-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="Categories">
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-2">
              <Link 
                href="/category/generative-art" 
                className="block text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                Best AI Generative Art Tools
              </Link>
              <Link 
                href="/category/social-media" 
                className="block text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                Best AI Social Media Tools
              </Link>
              <Link 
                href="/category/marketing" 
                className="block text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                Best AI Marketing Tools
              </Link>
              <Link 
                href="/category/copywriting" 
                className="block text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                Best AI Copywriting Tools
              </Link>
              <Link 
                href="/category/ai-detection" 
                className="block text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                Best AI Detection Tools
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Newsletter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Stay updated with the latest AI tools and trends.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="button-primary w-full"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
              {status === 'success' && (
                <p className="text-green-600 text-sm">Successfully subscribed!</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-sm">Subscription failed. Please try again.</p>
              )}
            </form>
          </div>
        </div>
        <div className="mt-8">
          <TrustpilotWidget />
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center text-muted-foreground text-sm">
          <div className="mb-4 space-x-4">
            <a 
              href="https://saas-boilerplate.eu/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-accent-foreground transition-colors"
            >
              Saas Boilerplate Starter
            </a>
            <span>·</span>
            <a 
              href="https://aiaccelerator.bg/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-accent-foreground transition-colors"
            >
              AI Automation Services
            </a>
            <span>·</span>
            <a 
              href="https://www.linkedin.com/in/man0l" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-accent-foreground transition-colors"
            >
              Created by Manol
            </a>
          </div>
          <div>© {new Date().getFullYear()} Best AI Tools. All rights reserved.</div>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-accent-foreground transition-colors">
              Terms & Conditions
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-accent-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 