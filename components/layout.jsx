import Container from "./Container";
import NavButton from "./NavButton";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();

  const isDarkPage =
    router.pathname.includes("requests") ||
    router.asPath.includes("/requests") ||
    router.asPath.includes("/requests/new");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ===== BACKGROUND ===== */}
      {isDarkPage ? <DarkBackground /> : <LightBackground />}

      {/* ===== HEADER ===== */}
      <header className="relative z-10 w-full pt-6">
        <Container>
          <div
            className={
              isDarkPage
                ? "rounded-2xl border border-white/10 bg-slate-800/60 backdrop-blur shadow-sm ring-1 ring-white/10"
                : "rounded-2xl border border-slate-300/60 bg-white/70 backdrop-blur shadow-sm ring-1 ring-black/5"
            }
          >
            <div className="flex items-center justify-between px-6 py-4">
              {/* Brand */}
              <div className="flex flex-col leading-tight">
                <span
                  className={
                    isDarkPage
                      ? "text-xl font-extrabold tracking-tight text-white"
                      : "text-xl font-extrabold tracking-tight text-slate-900"
                  }
                >
                  <a href="/">CRYPTO STREET</a>
                </span>

                <span
                  className={
                    isDarkPage ? "text-xs text-slate-300" : "text-xs text-slate-600"
                  }
                >
                  We don&apos;t fix the world, we build an alternative
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <NavButton href="/">Home</NavButton>
                <NavButton href="/committees/list">Committees</NavButton>
                <NavButton
                  href="/committees/new"
                  className={
                    isDarkPage
                      ? "h-10 w-10 px-0 py-0 bg-indigo-500 text-white hover:bg-indigo-600"
                      : "h-10 w-10 px-0 py-0 bg-slate-900 text-white hover:bg-slate-800"
                  }
                >
                  +
                </NavButton>
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div
            className={
              isDarkPage
                ? "mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                : "mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"
            }
          />
        </Container>
      </header>

      {/* ===== MAIN ===== */}
      <main className="relative z-10 flex-1 w-full py-8">
        <Container>
          {isDarkPage ? (
            <div className="text-slate-100">{children}</div>
          ) : (
            <div className="rounded-2xl border border-slate-300/60 bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-300/40">
              <div
                className="
                  p-6 md:p-8 text-slate-900

                  [&_h1]:text-slate-900 [&_h1]:font-extrabold [&_h1]:tracking-tight
                  [&_h2]:text-slate-900 [&_h2]:font-bold
                  [&_h3]:text-slate-700 [&_h3]:font-semibold
                  [&_p]:text-slate-700
                  [&_li]:text-slate-700
                  [&_label]:text-slate-700
                  [&_small]:text-slate-500
                  [&_a]:text-slate-800 [&_a:hover]:text-slate-900
                  [&_input]:text-slate-900
                  [&_textarea]:text-slate-900
                  [&_select]:text-slate-900
                  [&_button]:font-semibold
                "
              >
                {children}
              </div>
            </div>
          )}
        </Container>
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        className={
          isDarkPage
            ? "relative z-10 mt-auto w-full border-t border-white/10 bg-slate-800/50 backdrop-blur text-sm"
            : "relative z-10 mt-auto w-full border-t border-slate-300/60 bg-white/60 backdrop-blur text-sm"
        }
      >
        <Container className="py-4">
          <div
            className={
              isDarkPage
                ? "flex items-center justify-between text-slate-300"
                : "flex items-center justify-between text-slate-600"
            }
          >
            <span>© {new Date().getFullYear()} CRYPTO STREET</span>
            <span className={isDarkPage ? "text-slate-400" : "text-slate-500"}>
              We don&apos;t fix the world. We build an alternative.
            </span>
          </div>
        </Container>
      </footer>
    </div>
  );
}

/* ===== Backgrounds ===== */

function DarkBackground() {
  return (
    <>
      {/* כהה – אבל רך יותר */}
      <div className="absolute inset-0 -z-10 bg-slate-900" />
      <div className="absolute -z-10 -top-28 -left-28 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -z-10 -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute inset-0 -z-10 opacity-25 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.16)_1px,transparent_0)] [background-size:26px_26px]" />
    </>
  );
}

function LightBackground() {
  return (
    <>
      {/* אפור מעט כהה יותר – מודרני */}
      <div className="absolute inset-0 -z-10 bg-[#e4e8ef]" />
      <div className="absolute -z-10 -top-28 -left-28 h-[28rem] w-[28rem] rounded-full bg-slate-400/15 blur-3xl" />
      <div className="absolute -z-10 -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-indigo-300/15 blur-3xl" />
      <div className="absolute inset-0 -z-10 opacity-25 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:26px_26px]" />
    </>
  );
}
