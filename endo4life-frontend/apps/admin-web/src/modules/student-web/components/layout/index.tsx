import { ReactNode } from 'react';

interface Props {
  header?: ReactNode;
  children?: ReactNode;
}
export default function Layout({ header, children }: Props) {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <header className="flex-none w-full">{header}</header>
      <main className="flex-auto w-full overflow-y-auto">{children}</main>
    </div>
  );
}
