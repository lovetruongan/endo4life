import { ReactNode } from 'react';

interface Props {
  header?: ReactNode;
  navbar?: ReactNode;
  children?: ReactNode;
}
export default function Layout({ header, navbar, children }: Props) {
  return (
    <div className="flex flex-row w-screen h-screen overflow-hidden bg-neutral-background-layer-2">
      <nav className="flex-none h-full overflow-y-auto">{navbar}</nav>
      <main className="flex-auto h-full overflow-y-auto">{children}</main>
    </div>
  );
}
