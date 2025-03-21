'use client';
import { ThemeProvider, type ThemeProviderProps } from 'next-themes';
import { ReactNode } from 'react';

// Extend the props to include ThemeProviderProps
interface Props extends ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeWrapper({ 
  children,
  ...props  // Capture remaining next-themes props
}: Props) {
  return (
    <ThemeProvider {...props}>
      {children}
    </ThemeProvider>
  );
}