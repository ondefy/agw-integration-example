"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { createZyfiPaymaster } from "zyfi-agw-plugin";

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
    apiKey: "c187cf5a-c233-43f1-8bdb-0fe495138dce",
    sponsorshipRatio: 100,
    apiUrl: "https://staging.api.zyfi.org/api/"
  });

  return (
    <AbstractWalletProvider chain={abstractTestnet} customPaymasterHandler={paymaster}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </AbstractWalletProvider>
  );
}
