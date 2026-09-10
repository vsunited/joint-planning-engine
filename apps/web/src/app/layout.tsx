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
      <body className="min-h-screen bg-[#0b0f14] text-slate-100 flex flex-col antialiased">
        {/* Classification Banner */}
        <header className="bg-[#15803d] text-white text-xs font-bold tracking-widest text-center py-1 uppercase border-b border-green-700">
          UNCLASSIFIED // FOUO PRE-RELEASE
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
