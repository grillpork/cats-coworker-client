import { Anuphan, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth/provider/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id.apps.googleusercontent.com";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cats Coworker",
  description: "Cats Coworker multiplayer workspace dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider></body>
    </html>
  );
}
