"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { createZyfiPaymaster } from "zyfi-agw-plugin";
import dotenv from 'dotenv';
dotenv.config();

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const paymaster = createZyfiPaymaster({
    apiKey: process.env.NEXT_PUBLIC_ZYFI_API_KEY || '',
    sponsorshipRatio: 100,
    apiUrl: "https://api.zyfi.org/api/"
  });

  return (
    <AbstractWalletProvider chain={abstractTestnet} customPaymasterHandler={paymaster}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </AbstractWalletProvider>
  );
}
