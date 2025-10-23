import type { AppProps } from "next/app";
import "../styles/globals.css";
import { RoleProvider } from "../context/RoleContext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RoleProvider>
      <Head>
        <title>InspectFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </RoleProvider>
  );
}
