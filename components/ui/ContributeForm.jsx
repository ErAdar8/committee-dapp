import { useMemo, useState } from "react";
import { getWriteSigner } from "../../ETH/providersigner";
import { getCommitteeContract } from "../../components/contractInstance";
import Spinner from "./spinner"; // תתאים path לפי איפה שהSpinner אצלך

export default function ContributeForm({
  committeeAddress,
  minimumContributionWei,
  onSuccess,
}) {
  const [amountWei, setAmountWei] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const minWei = useMemo(() => {
    if (minimumContributionWei == null) return null;
    return typeof minimumContributionWei === "bigint"
      ? minimumContributionWei
      : BigInt(minimumContributionWei);
  }, [minimumContributionWei]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (!committeeAddress) throw new Error("Missing committee address.");

      if (!amountWei || !/^\d+$/.test(amountWei)) {
        throw new Error("Please enter a valid WEI amount.");
      }

      const valueWei = BigInt(amountWei);

      if (minWei != null && valueWei < minWei) {
        throw new Error(`Amount is below the minimum (${minWei.toString()} WEI).`);
      }

      setLoading(true);

      // ✅ MetaMask signer (opens popup on first request / tx)
      const signer = await getWriteSigner();

      // ✅ Contract instance using your helper
      const contract = getCommitteeContract(committeeAddress, signer);

      const tx = await contract.contribute({ value: valueWei });
      await tx.wait();

      setSuccessMsg("Contribution sent successfully ✅");
      setAmountWei("");

      if (onSuccess) await onSuccess();
    } catch (e) {
      const msg =
        e?.code === 4001
          ? "Transaction rejected in MetaMask."
          : e?.message || "Something went wrong.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Contribute to this committee
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Contribute ETH to become an approver.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Amount (WEI)
          </label>

          <input
            value={amountWei}
            onChange={(e) => setAmountWei(e.target.value)}
            
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
          />

          {minWei != null && (
            <p className="mt-1 text-xs text-slate-500">
              Minimum: {minWei.toString()} WEI
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner />
              Pending...
            </>
          ) : (
            "Contribute"
          )}
        </button>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}
      </form>
    </div>
  );
}
