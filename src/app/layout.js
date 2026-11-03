import localFont from "next/font/local";
import { Mrs_Saint_Delafield, Montserrat } from "next/font/google";
import "./globals.css";

const anton = localFont({
  src: "../../public/fonts/Anton-Regular.woff2",
  variable: "--font-anton",
  display: "swap",
  weight: "400",
  preload: true,
});

const script = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const wide = Montserrat({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-wide",
  display: "swap",
});

export const metadata = {
  title: "Rayansh Singh",
  description:
    "Entrepreneur. Founder of Socialsect — a growth and patient acquisition agency operating across India, the US, UK and Dubai. Host of One Day with Ray.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${script.variable} ${wide.variable}`}>
      <body>{children}</body>
    </html>
  );
}
