"use client";

import {
  useCreateSession,
  useLoginWithAbstract,
} from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { Button } from "@heroui/button";
import { FaCheckCircle } from "react-icons/fa";
import clsx from "clsx";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createSessionClient,
  LimitType,
  SessionClient,
  SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { toFunctionSelector, parseEther, encodeFunctionData } from "viem";
import { useState } from "react";
import { abstractTestnet } from "viem/chains";
import { MINT_ABI } from "./abi";

export default function Home() {
  const { login, logout } = useLoginWithAbstract();
  const { createSessionAsync } = useCreateSession();
  const [session, setSession] = useState<SessionConfig>();
  const [sessionClient, setSessionClient] = useState<SessionClient>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const account = useAccount();

  async function handleCreateSession() {
    const sessionPrivateKey = generatePrivateKey();
    const sessionSigner = privateKeyToAccount(sessionPrivateKey);

    const { session, transactionHash } = await createSessionAsync({
      session: {
        signer: sessionSigner.address,
        expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24), // 24 hours
        feeLimit: {
          limitType: LimitType.Lifetime,
          limit: parseEther("1"), // 1 ETH lifetime gas limit
          period: BigInt(0),
        },
        callPolicies: [
          {
            target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA", // Contract address
            selector: toFunctionSelector("mint(address,uint256)"), // Allowed function
            valueLimit: {
              limitType: LimitType.Unlimited,
              limit: BigInt(0),
              period: BigInt(0),
            },
            maxValuePerUse: BigInt(0),
            constraints: [],
          },
        ],
        transferPolicies: [],
      },
    });

    console.log("Session created", session, transactionHash);

    // Create a session client
    const sessionClient = createSessionClient({
      account: account.address!,
      chain: abstractTestnet,
      signer: sessionSigner,
      session: session,
    });

    setSessionClient(sessionClient);
    setSession(session);
  }

  async function sendSponsoredTx() {
    if (!sessionClient || !session) {
      console.error("No session client");
      return;
    }
    try {
      const paymasterData = await callZyfiApi(
        account.address, // OR session.signer,
        "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
        encodeFunctionData({
          abi: MINT_ABI,
          functionName: "mint",
          args: [session.signer, BigInt(1)],
        }),
        "0"
      );
      console.log(paymasterData, sessionClient);

      try {
        await sessionClient.sendTransaction({
          account: account.address!, // OR sessionClient.account
          to: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
          data: encodeFunctionData({
            abi: MINT_ABI,
            functionName: "mint",
            args: [session.signer, BigInt(1)],
          }),
          chain: abstractTestnet,
          paymaster: paymasterData.txData.customData.paymasterParams.paymaster,
          paymasterInput:
            paymasterData.txData.customData.paymasterParams.paymasterInput,
          maxPriorityFeePerGas: BigInt(0),
          maxFeePerGas: BigInt(paymasterData.txData.maxFeePerGas),
          gasLimit: BigInt(paymasterData.gasLimit),
        });
      } catch (e) {
        console.error("Error sending transaction");
        console.error(e);
        setError(true);
        return;
      }

      setSuccess(true);
    } catch (e) {
      console.error("Error calling Zyfi API");
      console.error(e);
      setError(true);
      return;
    }
  }

  async function callZyfiApi(
    from: any,
    to: string,
    calldata: string,
    value: string
  ) {
    try {
      // API Payload
      const payload = {
        // feeTokenAddress: tokenAddress,
        sponsorshipRatio: 100,
        chainId: 11124,
        replayLimit: 5,
        txData: {
          from,
          to,
          data: calldata,
          value,
        },
      };
      console.log("API payload", payload);

      // API answer
      const response = await fetch(
        "https://api.zyfi.org/api/erc20_sponsored_paymaster/v1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": `${process.env.NEXT_PUBLIC_ZYFI_API_KEY}`, // Replace by your API Key
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Zyfi API Error`);
    }
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {/* -------------------------------------------------------------------------- */
      /*                                Log in button                                */
      /* -------------------------------------------------------------------------- */}
      <div className="flex-row flex gap-6 justify-between items-center mb-10">
        <div className="text-md flex gap-2 items-center w-[20vw] justify-start">
          1. Login
          <FaCheckCircle
            className={clsx(
              "text-primary opacity-0",
              account.address != null && "opacity-100"
            )}
          />
        </div>
        <div className="flex gap-4 flex-col w-[50vw]">
          <Button isDisabled={account.address != null} onPress={login}>
            Login
          </Button>
          {account.address != null && (
            <p className="text-primary bg-primary-100/50 rounded-full px-2 py-1">
              AGW address: {account.address}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */
      /*                            Create a session key                            */
      /* -------------------------------------------------------------------------- */}
      <div className="flex-row flex gap-6 justify-between items-center mb-10">
        <div className="text-md flex gap-2 items-center w-[20vw] justify-start">
          2. Create a session key
          <FaCheckCircle
            className={clsx(
              "text-primary opacity-0 inline",
              session != null && "opacity-100"
            )}
          />
        </div>
        <div className="flex gap-4 flex-col w-[50vw]">
          <Button
            isDisabled={account.address == null || session != null}
            onPress={handleCreateSession}
          >
            Create a session key
          </Button>
          {session != null && (
            <p className="text-primary bg-primary-100/50 rounded-full px-2 py-1">
              Session key signer: {session.signer}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */
      /*                   Send sponsored tx with the session key                   */
      /* -------------------------------------------------------------------------- */}
      <div className="flex-row flex gap-6 justify-between items-center">
        <div className="text-md w-[20vw]">
          3. Send sponsored ty with the session key
          <FaCheckCircle
            className={clsx(
              "text-primary opacity-0 inline",
              success == true && "opacity-100"
            )}
          />
        </div>
        <div className="flex gap-4 flex-col w-[50vw]">
          <Button
            isDisabled={session == null || sessionClient == null}
            onPress={sendSponsoredTx}
          >
            Send sponsored tx
          </Button>
          {success == true && (
            <p className="text-primary bg-primary-100/50 rounded-full px-2 py-1">
              Transaction sent successfully
            </p>
          )}
          {error == true && (
            <p className="text-danger bg-red-900/50 rounded-full px-2 py-1">
              Error sending transaction, check the console
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
