import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Joint Planning Engine (JPE)',
  description: 'AI-assisted Joint Planning Process (JPP) workspace supporting Joint Staff and Combined Task Forces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d13] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
