import { useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { POLICY_VERSION } from '@/lib/envoke-constants';

interface AuthError {
  message: string;
}

interface SignUpParams {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const consentCheckedRef = useRef(false);

  const recordConsent = useCallback(async (userId: string) => {
    // onConflict + ignoreDuplicates makes this idempotent: both the session
    // check and the SIGNED_IN listener can attempt the insert concurrently
    // and the duplicate becomes a no-op instead of a duplicate-key error.
    const { error } = await supabase
      .from('consent_log')
      .upsert(
        { user_id: userId, policy_version: POLICY_VERSION },
        { onConflict: 'user_id,policy_version', ignoreDuplicates: true },
      );
    if (error) {
      console.error('Failed to record consent:', error.message);
    }
  }, []);

  const ensureConsentLogged = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('consent_log')
        .select('id')
        .eq('user_id', userId)
        .eq('policy_version', POLICY_VERSION)
        .maybeSingle();

      if (error) {
        console.error('Failed to check consent:', error.message);
        return;
      }

      if (!data) {
        await recordConsent(userId);
      }
    },
    [recordConsent],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (data.session?.user && !consentCheckedRef.current) {
        consentCheckedRef.current = true;
        (async () => {
          await ensureConsentLogged(data.session!.user.id);
        })();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && newSession?.user) {
        (async () => {
          await ensureConsentLogged(newSession!.user.id);
        })();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [ensureConsentLogged]);

  const signUpWithEmail = useCallback(
    async ({ email, password }: SignUpParams): Promise<{ error: AuthError | null }> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: { message: error.message } };

      if (data.user) {
        await recordConsent(data.user.id);
      }

      return { error: null };
    },
    [recordConsent],
  );

  const signInWithEmail = useCallback(
    async ({ email, password }: SignUpParams): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: { message: error.message } };
      return { error: null };
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<{ error: AuthError | null }> => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) return { error: { message: result.error.message } };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    consentCheckedRef.current = false;
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
}
