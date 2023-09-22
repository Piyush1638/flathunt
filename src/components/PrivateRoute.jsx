"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthState from '@hooks/useAuthState';
import { toast } from 'react-toastify';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const router = useRouter();
  const { loggedIn, checkState } = useAuthState();

  useEffect(() => {
    if (checkState) {
      return; // Wait for the authentication state to be checked
    }

    if (!loggedIn) {
        toast.info('You are not logged in');
      router.push('/');
    }
  }, [loggedIn, checkState, router]);

  if (checkState) {
    return <Loading/>;
  }

  return <>{children}</>;
};

export default PrivateRoute;
