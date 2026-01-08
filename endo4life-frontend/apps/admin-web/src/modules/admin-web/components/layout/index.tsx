import { ReactNode, useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

interface Props {
  header?: ReactNode;
  navbar?: ReactNode;
  children?: ReactNode;
}
export default function Layout({ header, navbar, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-row w-screen h-screen overflow-hidden bg-neutral-background-layer-2">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, visible on md+ */}
      <nav className={`
        fixed md:relative z-50 md:z-auto
        h-full overflow-y-auto bg-white md:bg-transparent
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex-none
      `}>
        {/* Close button on mobile */}
        <button 
          className="absolute top-4 right-4 p-2 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <HiX size={24} />
        </button>
        {navbar}
      </nav>

      {/* Main content */}
      <main className="flex-auto h-full overflow-y-auto">
        {/* Mobile header with hamburger */}
        <div className="sticky top-0 z-30 flex items-center gap-3 p-3 bg-white border-b md:hidden">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <HiMenu size={24} />
          </button>
          <img
            alt="logo"
            src="/images/logo.png"
            className="w-8 h-8"
          />
        </div>
        {children}
      </main>
    </div>
  );
}
