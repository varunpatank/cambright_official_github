import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Chapter Hub',
  description: 'Empowering communities through student volunteering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}