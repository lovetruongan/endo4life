import { ReactNode } from 'react';

interface Props {
  header?: ReactNode;
  navbar?: ReactNode;
  subNavbar?: ReactNode;
  children?: ReactNode;
}

export default function CoursesPageLayout({
  header,
  navbar,
  subNavbar,
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <header className="">{header}</header>
      <div className="flex flex-col h-screen overflow-hidden">
        <div>
          <nav className="">{navbar}</nav>
          <nav className="">{subNavbar}</nav>
        </div>
        <main className="flex-auto h-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
