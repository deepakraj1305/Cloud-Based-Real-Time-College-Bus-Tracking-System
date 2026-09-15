import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-ink-50 dark:bg-ink-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <footer className="px-6 py-4 text-center text-xs text-ink-500 border-t border-ink-200 dark:border-ink-800">
          CampusTransit · Cloud-Based Bus Tracking & Management · © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
