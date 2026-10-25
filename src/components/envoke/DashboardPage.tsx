import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Music, LogOut, Mail, Calendar, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/envoke/ui/Button';
import { supabase } from '@/integrations/supabase/client';
import { APP_NAME, POLICY_VERSION } from '@/lib/envoke-constants';
import type { ConsentLog } from '@/types/envoke';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [consent, setConsent] = useState<ConsentLog | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/auth', replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadConsent = () => {
      supabase
        .from('consent_log')
        .select('*')
        .eq('user_id', user.id)
        .order('agreed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setConsent(data as ConsentLog | null);
        });
    };
    loadConsent();
    // The consent write can still be in flight right after sign-in; re-check
    // once so the card doesn't read as permanently empty.
    const retry = setTimeout(loadConsent, 2500);
    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/auth', replace: true });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 bg-panel/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brass flex items-center justify-center shadow-lg shadow-ink/40">
              <Music className="w-5 h-5 text-cream" />
            </div>
            <span className="font-serif text-xl font-semibold text-cream tracking-tight">{APP_NAME}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-cream mb-2">
          Welcome{user.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-meta-light mb-10">Your account is set up and ready to go.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-btn border border-cream/10 bg-panel/40 p-6">
            <h2 className="text-sm font-medium text-meta-light uppercase tracking-wider mb-4">
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-meta-light/60" />
                <span className="text-sm text-cream/90">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-meta-light/60" />
                <span className="text-sm text-cream/90">
                  Joined {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-btn border border-cream/10 bg-panel/40 p-6">
            <h2 className="text-sm font-medium text-meta-light uppercase tracking-wider mb-4">
              Consent Record
            </h2>
            {consent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-sage" />
                  <span className="text-sm text-cream/90">
                    Agreed to policy version{' '}
                    <span className="text-cream font-medium">{consent.policy_version}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-meta-light/60" />
                  <span className="text-sm text-cream/90">{formatDate(consent.agreed_at)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-meta-light/60">No consent record found.</p>
            )}
            <p className="mt-4 text-xs text-meta-light/50">
              Current policy version: {POLICY_VERSION}. This record is permanent and cannot be
              edited.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
