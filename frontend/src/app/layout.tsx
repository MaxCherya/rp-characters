import { Provider } from "@/components/ui/provider"
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "RP Characters",
  description: "Create/generate unique characters for your stories.",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <Providers>
            {children}
          </Providers>
        </Provider>
      </body>
    </html>
  )
}
