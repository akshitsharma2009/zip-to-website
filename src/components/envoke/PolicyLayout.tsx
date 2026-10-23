import { type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Music } from 'lucide-react';
import { APP_NAME, POLICY_VERSION } from '@/lib/envoke-constants';

interface PolicySection {
  heading: string;
  body: ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  intro?: ReactNode;
  sections: PolicySection[];
}

export function PolicyLayout({ title, intro, sections }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 bg-panel/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass flex items-center justify-center shadow-md shadow-ink/40">
              <Music className="w-4 h-4 text-cream" />
            </div>
            <span className="font-serif text-lg font-semibold text-cream tracking-tight">{APP_NAME}</span>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm text-meta-light hover:text-brass transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign up
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-cream mb-2">{title}</h1>
        <p className="text-sm text-meta-light mb-10">Last updated: {POLICY_VERSION}</p>

        {intro && (
          <div className="mb-10 text-meta-light leading-relaxed text-base italic border-l-2 border-brass/40 pl-5 font-serif">
            {intro}
          </div>
        )}

        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="font-serif text-lg font-medium text-cream mb-2.5">{section.heading}</h2>
              <div className="text-sm leading-relaxed text-meta-light space-y-3">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
