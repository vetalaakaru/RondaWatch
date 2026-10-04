import { Stack, router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function RootLayout() {
  const pathname = usePathname();

  const handleRouteByRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !profile) return;

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
          .eq('id', userId)
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
      console.log('ROLE ROUTING ERROR:', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && (pathname === '/' || pathname === '/login')) {
          await handleRouteByRole(session.user.id);
        }
      } catch (error) {
        console.log('SESSION CHECK ERROR:', error);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      } else if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
        session?.user &&
        (pathname === '/' || pathname === '/login')
      ) {
        await handleRouteByRole(session.user.id);
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