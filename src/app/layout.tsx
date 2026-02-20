import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Building2, List, Bookmark, Search } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VC Scout",
  description: "Precision AI scout for VCs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-gray-50`}>
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">VC Scout</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/companies" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <Building2 size={18} />
              <span className="font-medium text-sm">Companies</span>
            </Link>
            <Link href="/lists" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <List size={18} />
              <span className="font-medium text-sm">My Lists</span>
            </Link>
            <Link href="/saved" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <Bookmark size={18} />
              <span className="font-medium text-sm">Saved Searches</span>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}