import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Gradient } from "@/components/ui/gradient";

export const runtime = 'edge';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Birthdays',
  description: 'For birthday reminders.',
  applicationName: 'Birthdays',
  authors: [{ name: 'Ranulph', url: 'https://ranulph.run' }],
  keywords: "Birthday reminders, annual reminders, birthday notifications",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#1A1A1A" }, { media: "(prefers-color-scheme: light)", color: "#FAFAFA" }],
  colorScheme: 'dark light',
  viewport: {
    width: 'device-width',
    height: 'device-height',
    interactiveWidget: 'resizes-content',
    initialScale: 1.0,
    minimumScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
    viewportFit: 'cover'
  },
  manifest: "https://birthdays.run/site.webmanifest",
  icons: [{ rel: "icon", url: "https://birthdays.run/android/android-launchericon-512-512.png" }, { rel: "apple-touch-icon", url: "https://birthdays.run/ios/512.png" }],
  openGraph: {
    type: "website",
    url: "https://birthdays.run",
    title: "Birthdays",
    description: "For birthday reminders.",
    siteName: "Birthdays",
  },
  appleWebApp: { capable: true, title: "Birthdays", statusBarStyle: "black-translucent" }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
          </ThemeProvider>
          <Gradient className="top-[-500px] opacity-[0.15] w-[1000px] h-[800px] pointer-events-none" />
        </body> 
      </html>
    </>
  )
}