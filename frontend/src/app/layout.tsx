
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SimpleWalletProvider } from "@/components/providers/wallet-provider-simple";

export const metadata: Metadata = {
  title: 'SolCraft',
  description: 'Trading Infrastructure for the Next Era of Solana',
  icons: {
    icon: '/solcraft-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SimpleWalletProvider>
          {children}
          <Toaster />
        </SimpleWalletProvider>
      </body>
    </html>
  );
}
