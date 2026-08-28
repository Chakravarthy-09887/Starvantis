import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MissionProvider } from "../context/MissionContext";
import SpacecraftCursor from "../components/SpacecraftCursor";

export const viewport: Viewport = {
  themeColor: "#05070B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "STARVANTIS — Fused Space Intelligence",
  description: "Fused Satellite Health & Space Debris Collision-Risk Intelligence Platform. One fused, explainable mission-risk picture.",
  keywords: "satellite, space debris, collision risk, orbital intelligence, mission control, digital twin, spacecraft health",
  authors: [{ name: "Starvantis Aerospace" }],
  openGraph: {
    title: "STARVANTIS — Fused Space Intelligence",
    description: "Fused Satellite Health & Space Debris Collision-Risk Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#05070B] text-star-white antialiased selection:bg-cyan-glow/20 selection:text-white" suppressHydrationWarning>
        <MissionProvider>
          {/* Universal Spacecraft Cursor rendered at the root level */}
          <SpacecraftCursor />
          {children}
        </MissionProvider>
      </body>
    </html>
  );
}
