import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CyberShield AI — Threat Intelligence Platform',
  description:
    'AI-Powered Cyber Threat Intelligence Platform for real-time security monitoring, threat detection, and incident response.',
  keywords: ['cybersecurity', 'threat intelligence', 'SOC', 'SIEM', 'AI', 'security dashboard'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
