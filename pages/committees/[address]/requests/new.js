import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import Spinner from "@/components/ui/spinner";
import NavButton from "../../../../components/NavButton";
import { getWriteSigner } from "../../../../ETH/providersigner";
import { getProvider } from "@/ETH/providers";
import { getCommitteeContract } from "@/components/contractInstance";

export default function NewRequestPage() {
  const router = useRouter();
  const { address } = router.query;

  // form state
  const [description, setDescription] = useState("");
  const [amountEth, setAmountEth] = useState("");
  const [recipient, setRecipient] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // auth/guard
  const [manager, setManager] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const isManager = useMemo(() => {
    if (!walletAddress || !manager) return false;
    return walletAddress.toLowerCase() === manager.toLowerCase();
  }, [walletAddress, manager]);

  // load manager (read-only)
  useEffect(() => {
    if (!address) return;

    let alive = true;

    (async () => {
      try {
        setError("");
        const provider = await getProvider();
        const committee = getCommitteeContract(address, provider);
        const m = await committee.manager();
        if (!alive) return;
        setManager(m);
      } catch (e) {
        setError(e?.reason || e?.message || "Failed to load committee manager");
      }
    })();

    return () => {
      alive = false;
    };
  }, [address]);

  async function connectWallet() {
    try {
      setError("");
      setSuccess("");
      const signer = await getWriteSigner();
      const user = await signer.getAddress();
      setWalletAddress(user);
    } catch (e) {
      setError(e?.reason || e?.message || "Failed to connect wallet");
    }
  }

  function validate() {
    if (!description.trim()) return "Description is required";
    if (!amountEth || Number(amountEth) <= 0) return "Amount must be greater than 0";
    if (!recipient.trim()) return "Recipient address is required";
    if (!ethers.isAddress(recipient.trim())) return "Recipient must be a valid Ethereum address";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) return setError(v);

    if (!walletAddress) return setError("Please connect your wallet first");
    if (!isManager) return setError("Only the committee manager can create requests");

    try {
      setLoading(true);

      const signer = await getWriteSigner();
      const committee = getCommitteeContract(address, signer);
      const valueWei = ethers.parseEther(amountEth);

      const tx = await committee.createRequest(description.trim(), valueWei, recipient.trim());
      await tx.wait();

      setSuccess("Request created successfully ✅");

      setTimeout(() => {
        router.push(`/committees/${address}/requests`);
      }, 700);
    } catch (e) {
      setError(e?.reason || e?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Web3 glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-[-180px] top-[240px] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Light modern container (solves the “white margins” / glare problem) */}
        <div className="rounded-3xl border border-white/10 bg-slate-100/95 p-6 text-slate-900 shadow-xl shadow-black/20 backdrop-blur">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New Request</h1>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="break-all">
                  Committee:{" "}
                  <span className="font-mono text-slate-800">{address}</span>
                </p>
                {manager && (
                  <p className="break-all">
                    Manager:{" "}
                    <span className="font-mono text-slate-800">{manager}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <NavButton href={`/committees/${address}/requests`} className="px-4">
                ← Back
              </NavButton>

              {!walletAddress ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-xs text-slate-600 break-all">
                  Wallet:{" "}
                  <span className="font-mono text-slate-800">{walletAddress}</span>
                </div>
              )}

              {walletAddress && !isManager && manager && (
                <div className="text-xs font-medium text-amber-700">
                  Only manager can submit this form
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {(error || success) && (
            <div className="mt-5 space-y-3">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Form Card */}
          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Description
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Fix elevator / Painting / Electricity bill"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Amount (ETH)
                </label>
                <input
                  value={amountEth}
                  onChange={(e) => setAmountEth(e.target.value)}
                  placeholder="0.05"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Tip: ETH will be converted to WEI automatically on submit.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Recipient
                </label>
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size={18} />
                    <span>Loading</span>
                  </div>
                ) : (
                  "Create Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
