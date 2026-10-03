import { useEffect, useRef } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function RootLayout() {
  const pathname = usePathname();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;

    checkedRef.current = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          return;
        }

        if (pathname !== '/' && pathname !== '/login') {
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          return;
        }

        if (profile.role === 'resident') {
          router.replace('/resident');
          return;
        }

        if (profile.role === 'barangay_officer') {
          router.replace('/officer');
          return;
        }

        if (profile.role === 'tanod') {
          const { data: tanod } = await supabase
            .from('tanod_profiles')
            .select('verification_status')
            .eq('id', session.user.id)
            .single();

          if (tanod?.verification_status === 'approved') {
            router.replace('/tanod');
            return;
          }

          if (tanod?.verification_status === 'pending') {
            router.replace('/tanod-pending');
            return;
          }

          if (tanod?.verification_status === 'rejected') {
            await supabase.auth.signOut();
            router.replace('/');
          }
        }
      } catch (error) {
        console.log('SESSION CHECK ERROR:', error);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
