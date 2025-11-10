import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solana Guessing Game',
  description: 'A decentralized guessing game built on Solana',
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
