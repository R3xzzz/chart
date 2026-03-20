import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aviation Chart Viewer',
  description: 'Private aviation chart viewer for flight simulation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, 'bg-slate-950 text-slate-50 min-h-screen antialiased selection:bg-blue-900 selection:text-white')}>
        {children}
      </body>
    </html>
  );
}
