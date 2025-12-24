import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { getProvider } from "../../ETH/providers";
import { getFactoryContract } from "../../ETH/factory";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NavButton from "@/components/NavButton";

export default function CommitteeIndexPage() {
  const router = useRouter();

  const [committees, setCommittees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCommittees() {
      try {
        setIsLoading(true);

        const provider = await getProvider();
        const factory = getFactoryContract(provider);

        const deployed = await factory.getDeployedCommittees(); // (addresses)
        setCommittees(deployed || []);
      } catch (err) {
        console.error("loadCommittees() error:", err);
        setCommittees([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommittees();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Decentralized Committees in Action</h1>
          <p className="text-sm text-slate-600">
           Every committee here is governed by smart contracts, not assumptions
          </p>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold mt-2">On-Chain Committees</h2>

      {/* Content */}
      {isLoading ? (
        <div className="text-sm text-slate-600">Loading committees…</div>
      ) : committees.length === 0 ? (
        <Card className="p-2 border-2 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>No committees yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Create the first committee to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
       {committees.map((address) => (
  <Link
    key={address}
    href={`/committees/${address}`}
    className="block"
  >
    <Card className="p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer">
      <CardHeader>
        <CardTitle className="break-all">{address}</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          View committee details and manage actions.
        </p>

        {/* אופציונלי: להשאיר טקסט קטן במקום button */}
        <span className="text-sm font-medium text-emerald-700 whitespace-nowrap">
          View →
        </span>
      </CardContent>
    </Card>
  </Link>
))}

        </div>
      )}

      {/* Bottom Action */}
      <div className="mt-6 flex justify-end">
        <NavButton href="/committees/new">+ Create Committee</NavButton>
      </div>
    </div>
  );
}
