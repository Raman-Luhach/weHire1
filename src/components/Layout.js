import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
  };

  // Simplified navigation with just Dashboard and Jobs
  let navigation = [
    { name: 'Dashboard', href: user?.role === 'HR' ? '/hr' : (user?.role === 'Hiring Manager' ? '/manager' : '/dashboard'), icon: HomeIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 backdrop-blur bg-white/90 dark:bg-gray-800/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section: Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center group mr-6">
                <div className="relative h-10 w-10 mr-2 transition-transform duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg transform rotate-6 shadow-md group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  WeHire
                </span>
              </Link>
              
              {/* Navigation - Now directly next to the logo */}
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 ${
                      router.pathname.startsWith(item.href)
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-300'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right section: Theme, User Profile, Logout */}
            <div className="flex items-center space-x-3">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                )}
              </button>

              {/* User Profile - Show username with role on hover */}
              <div className="relative group">
                <div className="flex items-center px-3 py-1.5 rounded-md group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors duration-200">
                  <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username || 'Guest'}
                  </span>
                  
                  {/* Role tooltip on hover */}
                  <div className="absolute -bottom-10 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 px-3 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      Role: {user?.role || 'Visitor'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Logout
              </button>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - slide down animation */}
      <div 
        className={`md:hidden transform ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} transition-all duration-300 absolute w-full z-20 bg-white dark:bg-gray-800 shadow-md`}
        style={{ visibility: mobileMenuOpen ? 'visible' : 'hidden' }}
      >
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith(item.href)
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300'
              } transition-colors duration-200`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </div>
            </Link>
          ))}
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-3">
            <div className="flex items-center px-3 py-2">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {user?.username || 'Guest'}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.role || 'Visitor'}
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-md transition-colors duration-200"
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
} 