import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case 'HR':
          router.push('/hr');
          break;
        case 'Hiring Manager':
          router.push('/manager');
          break;
        default:
          router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
} 