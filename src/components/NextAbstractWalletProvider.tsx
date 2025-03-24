"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { createZyfiPaymaster } from 'zyfi-agw-plugin';
import dotenv from 'dotenv';
dotenv.config();

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const paymaster = createZyfiPaymaster({
    apiKey: process.env.NEXT_PUBLIC_ZYFI_API_KEY || '',
    sponsorshipRatio: 100,
    apiUrl: "https://staging.api.zyfi.org/api/"
  });
  return (
    <AbstractWalletProvider chain={abstractTestnet} customPaymasterHandler={paymaster}>
      {children}
    </AbstractWalletProvider>
  );
}
