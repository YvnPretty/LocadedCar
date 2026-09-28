"use client";
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useSessionState } from '@/hooks/useSessionState';
export default function ResumeLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const [lastRoute] = useSessionState(`navigation:${href}`, href);
  const safe = lastRoute === href || lastRoute.startsWith(`${href}/`);
  return <Link {...props} href={safe ? lastRoute : href} />;
}
