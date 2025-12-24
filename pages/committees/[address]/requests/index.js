import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import NavButton from "../../../../components/NavButton";
import { getProvider } from "../../../../ETH/providers";
import { getCommitteeContract } from "../../../../components/contractInstance";
import { getWriteSigner } from "../../../../ETH/providersigner";
import Spinner from "../../../../components/ui/spinner";

async function fetchAllRequestsLoop(contract, max = 200) {
  const results = [];

  for (let i = 0; i < max; i++) {
    try {
      const r = await contract.requests(i);

      results.push({
        id: i,
        description: r[0],
        valueWei: r[1],
        recipient: r[2],
        complete: r[3],
        approvalCount: Number(r[4]),
      });
    } catch (e) {
      break;
    }
  }

  return results;
}

export default function RequestsIndex() {
  const router = useRouter();
  const { address } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [manager, setManager] = useState("");
  const [approversCount, setApproversCount] = useState(0);
  const [requests, setRequests] = useState([]);

  const [walletAddress, setWalletAddress] = useState("");
  const [txLoading, setTxLoading] = useState({ type: "", id: null });

  const isManager = useMemo(() => {
    if (!walletAddress || !manager) return false;
    return walletAddress.toLowerCase() === manager.toLowerCase();
  }, [walletAddress, manager]);

  async function refresh() {
    if (!address) return;

    const provider = await getProvider();
    const committee = getCommitteeContract(address, provider);

    const [m, approversCnt] = await Promise.all([
      committee.manager(),
      committee.approversCount(),
    ]);

    setManager(m);
    setApproversCount(Number(approversCnt));

    const allReqs = await fetchAllRequestsLoop(committee, 200);
    setRequests(allReqs);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!address) return;
      try {
        setLoading(true);
        setError("");
        await refresh();
      } catch (e) {
        if (alive) setError(e?.reason || e?.message || "Failed to load requests");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function connectWallet() {
    try {
      setError("");
      const signer = await getWriteSigner();
      const user = await signer.getAddress();
      setWalletAddress(user);
    } catch (e) {
      setError(e?.reason || e?.message || "Failed to connect wallet");
    }
  }

  async function onApprove(id) {
    try {
      setError("");
      if (!walletAddress) await connectWallet();

      setTxLoading({ type: "approve", id });

      const signer = await getWriteSigner();
      const committee = getCommitteeContract(address, signer);

      const tx = await committee.approveRequest(id);
      await tx.wait();

      await refresh();
    } catch (e) {
      setError(e?.reason || e?.message || "Approve failed");
    } finally {
      setTxLoading({ type: "", id: null });
    }
  }

  async function onFinalize(id) {
    try {
      setError("");
      if (!walletAddress) await connectWallet();

      setTxLoading({ type: "finalize", id });

      const signer = await getWriteSigner();
      const committee = getCommitteeContract(address, signer);

      const tx = await committee.finalizeRequest(id);
      await tx.wait();

      await refresh();
    } catch (e) {
      setError(e?.reason || e?.message || "Finalize failed");
    } finally {
      setTxLoading({ type: "", id: null });
    }
  }

  const active = requests.filter((r) => !r.complete);
  const completed = requests.filter((r) => r.complete);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Web3 glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-[-170px] top-[240px] h-[340px] w-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* "השוליים" שאתה מתכוון אליהם */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Container חדש: אפור קליל מודרני */}
        <div className="rounded-3xl border border-white/10 bg-slate-100/95 p-6 text-slate-900 shadow-xl shadow-black/20 backdrop-blur">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Requests
              </h1>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="break-all">
                  Committee:{" "}
                  <span className="font-mono text-slate-900">{address}</span>
                </p>

                {manager && (
                  <p className="break-all">
                    Manager:{" "}
                    <span className="font-mono text-slate-900">{manager}</span>
                  </p>
                )}

                <p>
                  Approvers:{" "}
                  <span className="font-semibold text-slate-900">
                    {approversCount}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <NavButton href={`/committees/${address}`} className="px-4">
                ← Back to Committee
              </NavButton>

              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-xs text-slate-600 break-all">
                  Wallet:{" "}
                  <span className="font-mono text-slate-900">{walletAddress}</span>
                </div>
              )}

              {isManager && (
                <NavButton href={`/committees/${address}/requests/new`} className="px-4">
                  + Create Request
                </NavButton>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <Section
            title="Active Requests"
            loading={loading}
            emptyText="No active requests."
            items={active}
            approversCount={approversCount}
            walletAddress={walletAddress}
            isManager={isManager}
            txLoading={txLoading}
            onApprove={onApprove}
            onFinalize={onFinalize}
          />

          <div className="mt-6">
            <Section
              title="Completed Requests"
              loading={loading}
              emptyText="No completed requests."
              items={completed}
              approversCount={approversCount}
              walletAddress={walletAddress}
              isManager={isManager}
              txLoading={txLoading}
              onApprove={onApprove}
              onFinalize={onFinalize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  loading,
  emptyText,
  items,
  approversCount,
  walletAddress,
  isManager,
  txLoading,
  onApprove,
  onFinalize,
}) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      {loading ? (
        <div className="mt-4 text-slate-600">Loading...</div>
      ) : items.length === 0 ? (
        <div className="mt-4 text-slate-600">{emptyText}</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((r) => {
            const isBusy = txLoading.id === r.id;
            const approving = isBusy && txLoading.type === "approve";
            const finalizing = isBusy && txLoading.type === "finalize";

            return (
              <li
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500">
                      Request #{r.id}
                    </div>

                    <div className="mt-1 font-semibold text-slate-900 break-words">
                      {r.description}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      Amount:{" "}
                      <span className="font-semibold text-slate-900">
                        {ethers.formatEther(r.valueWei)} ETH
                      </span>
                      {" • "}
                      Recipient:{" "}
                      <span className="font-mono text-slate-900 break-all">
                        {r.recipient}
                      </span>
                      {" • "}
                      Approvals:{" "}
                      <span className="font-semibold text-slate-900">
                        {r.approvalCount}/{approversCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                    <button
                      onClick={() => onApprove(r.id)}
                      disabled={!walletAddress || r.complete || isBusy}
                      className="inline-flex w-[110px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {approving ? <Spinner size={18} /> : "Approve"}
                    </button>

                    <button
                      onClick={() => onFinalize(r.id)}
                      disabled={!walletAddress || !isManager || r.complete || isBusy}
                      className="inline-flex w-[110px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {finalizing ? <Spinner size={18} /> : "Finalize"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
