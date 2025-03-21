"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { createZyfiPaymaster } from 'zyfi-agw-plugin';

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const paymaster = createZyfiPaymaster({
    apiKey: "c187cf5a-c233-43f1-8bdb-0fe495138dce",
    sponsorshipRatio: 100,
    apiUrl: "https://staging.api.zyfi.org/api/"
  });
  return (
    <AbstractWalletProvider chain={abstractTestnet} customPaymasterHandler={paymaster}>
      {children}
    </AbstractWalletProvider>
  );
}
