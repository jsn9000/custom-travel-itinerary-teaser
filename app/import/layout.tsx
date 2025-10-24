import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Import',
  description: 'Import trips from Wanderlog',
};

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
