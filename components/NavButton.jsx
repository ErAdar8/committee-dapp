import Link from "next/link";

export default function NavButton({ href, children, className = "", variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap " +
    "min-h-[40px] rounded-xl px-5 py-2.5 text-sm font-semibold leading-none " +
    "transition-all active:scale-[0.98]";

  const styles =
    variant === "dark"
      ? "bg-slate-900 text-white border border-white/10 hover:bg-slate-800"
      : "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 !text-white border border-white/10 " +
        "hover:from-blue-500 hover:to-indigo-500 shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/25";

  return (
    <Link href={href} className={[base, styles, className].join(" ")}>
      {children}
    </Link>
  );
}
