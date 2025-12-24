import { useState } from "react";
import { useRouter } from "next/router";
import NavButton from "@/components/NavButton";

import { getWriteSigner } from "../../ETH/providersigner";
import { getFactoryContract } from "../../ETH/factory";
import Spinner from "@/components/ui/spinner";
export default function NewCommitteePage() {
  const router = useRouter();

  const [minWei, setMinWei] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showDebug, setShowDebug] = useState(false);
  const [debug, setDebug] = useState({
    ethereum: null,
    chainId: null,
    account: null,
  });

  const refreshDebug = async () => {
    if (typeof window === "undefined") return;

    try {
      const ethereumExists = !!window.ethereum;

      if (!ethereumExists) {
        setDebug({ ethereum: false, chainId: null, account: null });
        return;
      }

      const [chainId, accounts] = await Promise.all([
        window.ethereum.request({ method: "eth_chainId" }),
        window.ethereum.request({ method: "eth_accounts" }),
      ]);

      setDebug({
        ethereum: true,
        chainId,
        account: accounts?.[0] || null,
      });
    } catch {
      setDebug({ ethereum: "ERROR", chainId: "ERROR", account: "ERROR" });
    }
  };

  const connectMetaMask = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await getWriteSigner();
      setSuccess("MetaMask is connected");

      if (showDebug) {
        await refreshDebug();
      }
    } catch (err) {
      setError(err?.message || "Could not connect to MetaMask.");

      if (showDebug) {
        await refreshDebug();
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!minWei || Number(minWei) <= 0) {
      setError("Please enter a valid minimum contribution (in wei).");
      return;
    }

    setLoading(true);

    try {
      const signer = await getWriteSigner();
      const factory = getFactoryContract(signer);

      const tx = await factory.createCommittee(minWei);

      setSuccess("Transaction sent. Waiting for confirmation...");
      await tx.wait();

      setSuccess("Committee created successfully. Redirecting...");
      setTimeout(() =>  router.push(`/committees/list`), 600);
    } catch (err) {
      setError(err?.reason || err?.shortMessage || err?.message || "Something went wrong.");

      if (showDebug) {
        await refreshDebug();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDebug = async () => {
    const next = !showDebug;
    setShowDebug(next);

    // If user opens Debug, refresh it immediately
    if (next) {
      await refreshDebug();
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Card */}
        <div className="rounded-2xl border bg-white/70 backdrop-blur px-6 py-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create New Committee</h1>
              <p className="mt-1 text-sm text-gray-600">
                Connect MetaMask on Sepolia and create a new committee from the Factory contract.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDebug}
                className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                {showDebug ? "Hide Debug" : "Debug"}
              </button>
<NavButton
  href={`/`}
  className="!text-black"
>
  ← Back
</NavButton>

            </div>
          </div>
        </div>

        {/* Debug Panel (Hidden by default) */}
        {showDebug && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Debug</div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={refreshDebug}
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={connectMetaMask}
                  disabled={loading}
                  className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60 transition"
                >
                  Connect MetaMask
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-medium">window.ethereum:</span>{" "}
                {debug.ethereum === null ? "not checked" : String(debug.ethereum)}
              </div>
              <div>
                <span className="font-medium">chainId:</span>{" "}
                {debug.chainId === null ? "not checked" : String(debug.chainId)}
              </div>
              <div>
                <span className="font-medium">account:</span>{" "}
                {debug.account === null ? "not checked / not connected" : String(debug.account)}
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Minimum Contribution <span className="text-gray-500">(wei)</span>
              </label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  value={minWei}
                  onChange={(e) => setMinWei(e.target.value)}
                  placeholder="enter min contribution for your committe "
                  inputMode="numeric"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none
                             focus:ring-2 focus:ring-black/10 focus:border-gray-400
                             placeholder:text-gray-400"
                />
<button
  type="submit"
  disabled={loading}
  className="
    relative
    inline-flex items-center justify-center
    rounded-xl px-7 py-3
    text-sm font-semibold text-white
    bg-gradient-to-r from-blue-600 to-blue-700
    hover:from-blue-700 hover:to-blue-800
    shadow-lg shadow-blue-500/30
    transition
    active:scale-[0.97]
    disabled:opacity-70 disabled:cursor-not-allowed
  "
>
  {loading ? <Spinner /> : "Create Committee"}
</button>


              </div>

              <p className="mt-2 text-xs text-gray-500">
                If MetaMask is already connected, you may not see a popup again.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={connectMetaMask}
                  disabled={loading}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Connect MetaMask
                </button>

                <span className="text-xs text-gray-500">
                  (Optional, only needed if you are not connected yet.)
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
