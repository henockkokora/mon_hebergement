import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DisableSWDev from "./DisableSWDev";
import { Toaster } from 'react-hot-toast';

const geistSans = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Plateforme immobilière | GELocation",
  description:
    "Facilitez la location et la vente immobilière : publiez vos biens avec photos/vidéos, choisissez la durée d'affichage, et laissez les clients visiter virtuellement.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DisableSWDev />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
