import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyFlow AI — Your academic operating system',
  description: 'Adaptive study planning, task tracking, analytics, exams, topics and AI scheduling.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
