import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface SidebarLayoutProps {
  children: ReactNode;
  role?: string;
}

export default function SidebarLayout({ children, role }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}