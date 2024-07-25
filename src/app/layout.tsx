import localFont from "next/font/local";
import { Lato } from 'next/font/google'

import "./css/globals.css";
import { VideoPlayerProvider } from "./components/VideoPlayer/VideoPlayerProvider";
import { Page } from "./components/layout/Page";
import { VideoPlayerWrapper } from "./components/layout/VideoPlayerWrapper";

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

interface Props {
  children: React.ReactNode;
}

export default function RootLayout ({ children }: Readonly<Props>) {
  return (
    <html lang="en">
      <body className={`${lato.className} min-w-[320px]`}>
        <VideoPlayerProvider>
          <VideoPlayerWrapper>
            <Page>
              {children}
            </Page>
          </VideoPlayerWrapper>
        </VideoPlayerProvider>
      </body>
    </html>
  );
}
