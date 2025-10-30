import { ReactNode } from 'react';
import Footer from '../footer';

interface Props {
  header?: ReactNode;
  children?: ReactNode;
}

export default function Layout({ header, children }: Props) {
  return (
    <div className="flex flex-col w-screen min-h-screen">
      {/* Header - Fixed at top */}
      <header className="flex-none w-full">{header}</header>
      
      {/* Main Content - Flexible */}
      <main className="flex-auto w-full overflow-y-auto">
        {children}
      </main>
      
      {/* Footer - Fixed at bottom */}
      <Footer />
    </div>
  );
}