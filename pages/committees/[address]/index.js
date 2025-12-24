import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import Container from "../../../components/Container";
import ContributeForm from "../../../components/ui/ContributeForm";

import { getProvider } from "../../../ETH/providers";
import { getCommitteeContract } from "../../../components/contractInstance";
import NavButton from "../../../components/NavButton";

export default function CommitteeShowPage() {
  const router = useRouter();
  const { address } = router.query;

  const [provider, setProvider] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // WEI helper modal
  const [showWeiHelp, setShowWeiHelp] = useState(false);
  const [ethInput, setEthInput] = useState("1");

  const weiOut = useMemo(() => {
    try {
      // ethers v6: parseEther -> bigint
      return ethers.parseEther(ethInput || "0").toString();
    } catch {
      return "";
    }
  }, [ethInput]);

  // 1) Init provider once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await getProvider();
        if (alive) setProvider(p);
      } catch (err) {
        if (alive) setError(err?.message || "Failed to init provider");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2) Build contract instance
  const BuildingCommittee = useMemo(() => {
    if (!provider) return null;
    if (!address) return null;
    if (!ethers.isAddress(address)) return null;

    return getCommitteeContract(address, provider);
  }, [address, provider]);

  // 3) Load committee data
  const loadCommitteeData = useCallback(async () => {
    if (!router.isReady) return;
    if (!provider) return;
    if (!BuildingCommittee) return;

    setLoading(true);
    setError("");

    try {
      const [manager, minimumContribution, approversCount, contractBalanceWei] =
        await Promise.all([
          BuildingCommittee.manager(),
          BuildingCommittee.minimumContribution(),
          BuildingCommittee.approversCount(),
          provider.getBalance(address),
        ]);

      setData({
        address,
        manager,
        minimumContributionWei: minimumContribution.toString(),
        approversCount: approversCount.toString(),
        balanceWei: contractBalanceWei.toString(),
      });
    } catch (err) {
      setError(err?.message || "Failed to load committee data");
    } finally {
      setLoading(false);
    }
  }, [router.isReady, provider, BuildingCommittee, address]);

  // 4) Initial fetch
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadCommitteeData();
    })();

    return () => {
      alive = false;
    };
  }, [loadCommitteeData]);

  if (!router.isReady) return null;

  return (
    <Container>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Committee</h1>
            <p className="mt-2 text-sm text-slate-600 break-all">
              Address: <span className="font-mono">{address}</span>
            </p>

            {/* WEI helper trigger */}
            <button
              type="button"
              onClick={() => setShowWeiHelp(true)}
              className="mt-2 text-xs font-medium text-slate-600 underline hover:text-slate-900"
            >
              not sure what is WEI?
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/committees/list")}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              ← Back to Committees
            </button>

            {/* Requests button (NavButton) */}
            {address && (
              <NavButton href={`/committees/${address}/requests`} className="px-4">
                Requests
              </NavButton>
            )}
          </div>
        </div>

        {/* States */}
        {loading && (
          <p className="mt-6 text-sm text-slate-600">Loading committee data…</p>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Layout: stats + contribute form */}
        {data && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <StatCard title="Committee Balance (WEI)" value={data.balanceWei} />

              <StatCard
                title="Minimum Contribution (WEI)"
                value={data.minimumContributionWei}
              />

              <StatCard title="Contributors" value={data.approversCount} />

              <StatCard
                title="Manager"
                value={`${data.manager.slice(0, 6)}…${data.manager.slice(-4)}`}
                subValue={data.manager}
              />
            </div>

            <div className="lg:col-span-4">
              <ContributeForm
                committeeAddress={address}
                minimumContributionWei={data.minimumContributionWei}
                onSuccess={loadCommitteeData}
              />
            </div>
          </div>
        )}
      </div>

      {/* WEI modal */}
      {showWeiHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowWeiHelp(false)}
          />

          <div className="relative w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ETH ⇄ WEI calculator
                </h3>
                <p className="mt-1 text-sm text-slate-600">1 ETH = 10^18 WEI</p>
              </div>

              <button
                type="button"
                onClick={() => setShowWeiHelp(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-800">
                ETH amount
              </label>
              <input
                value={ethInput}
                onChange={(e) => setEthInput(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
                placeholder="e.g. 0.05"
              />

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">WEI output</div>
                <div className="mt-1 break-all font-mono text-sm text-slate-900">
                  {weiOut || "—"}
                </div>
              </div>

             
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function StatCard({ title, value, subValue }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 overflow-hidden">
      <div className="text-2xl font-semibold break-words">{value}</div>
      <div className="mt-2 text-sm text-slate-600">{title}</div>

      {subValue && (
        <div className="mt-2 break-all text-xs font-mono text-slate-500">
          {subValue}
        </div>
      )}
    </div>
  );
}
