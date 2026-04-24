import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/providers/AuthProvider';
import { PWAProvider } from '../components/providers/PWAProvider';
import { OfflineProvider } from '../components/providers/OfflineProvider';
import { OfflineBanner } from '../components/ui/OfflineBanner';
import MSULogo from '../components/ui/MSULogo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DzidzaAI - Midlands State University Indigenous Language Learning Platform',
  description: 'AI-powered educational platform by Midlands State University supporting indigenous language learning in Zimbabwe',
  keywords: 'education, AI, Shona, Ndebele, Tonga, learning, Zimbabwe, Midlands State University, MSU',
  authors: [{ name: 'Midlands State University - DzidzaAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={inter.className}>
        <PWAProvider>
          <AuthProvider>
            <OfflineProvider>
              <OfflineBanner />
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                      <div className="flex items-center">
                        <MSULogo size="small" className="mr-3" showText={false} />
                        <span className="text-xl font-semibold text-gray-900">DzidzaAI</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Powered by Midlands State University</span>
                      </div>
                    </div>
                  </div>
                </header>
                <main>
                  {children}
                </main>
              </div>
            </OfflineProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#0284c7',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
