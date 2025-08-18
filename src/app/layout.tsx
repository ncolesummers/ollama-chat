import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

// Add a script to prevent FOUC (Flash of Unstyled Content) for animations
const motionScript = `
  window.motionPreferredReducedMotion = false;
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--motion-opacity', '1');
    document.documentElement.style.setProperty('--motion-transform', 'none');
  }
`;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ollama Chat',
  description: 'Chat with local LLMs using Ollama',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
