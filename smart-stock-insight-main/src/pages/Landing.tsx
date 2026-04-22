import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Search, UserRound } from "lucide-react";
import HeroGlobe from "@/components/HeroGlobe";

const screenerRows = [
  { symbol: "RELIANCE", price: "1,363.40", change: "+0.01%", sector: "Energy" },
  { symbol: "HDFCBANK", price: "803.00", change: "+0.95%", sector: "Finance" },
  { symbol: "BHARTIARTL", price: "1,860.70", change: "+0.79%", sector: "Telecom" },
  { symbol: "SBIN", price: "1,110.70", change: "+0.26%", sector: "Finance" },
  { symbol: "TCS", price: "2,584.10", change: "+0.17%", sector: "Technology" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-shell min-h-screen text-white">
      <header className="landing-nav sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="h-7 w-7 rounded bg-white/90 text-black grid place-content-center text-xs font-bold">SS</span>
            <span>SmartStock</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm text-white/85">
            <a href="#markets" className="hover:text-white transition">Markets</a>
            <a href="#screener" className="hover:text-white transition">Screener</a>
            <a href="#analysis" className="hover:text-white transition">Analysis</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex landing-search">
              <Search className="h-4 w-4" />
              Search stocks
            </button>
            <button className="icon-button"><Globe className="h-4 w-4" /></button>
            <button className="icon-button"><UserRound className="h-4 w-4" /></button>
            <button
              onClick={() => navigate("/app")}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <section id="markets" className="relative overflow-hidden px-4 pb-20 pt-14 md:px-8 md:pt-24">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(340px,0.78fr)_minmax(520px,1.22fr)] lg:items-center lg:gap-12">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
                NEW PCA + ML market engine
              </p>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-tight md:text-7xl lg:text-[5.4rem]">
                Look first.
                <br />
                Then leap.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-white/80 md:text-2xl">
                Research structure, decode clusters, and commit with confidence using a production-ready stock intelligence stack.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/app")}
                  className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black shadow-[0_20px_80px_rgba(255,255,255,0.2)]"
                >
                  Start now
                </button>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-6 py-4 text-lg font-medium backdrop-blur hover:bg-white/10 transition"
                >
                  Open dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="relative h-[320px] sm:h-[380px] lg:h-[540px] lg:pl-2">
              <div className="hero-globe-shell h-full w-full overflow-hidden rounded-[28px] border border-cyan-300/25 bg-slate-950/35 shadow-[0_0_90px_rgba(56,189,248,0.2)] backdrop-blur">
                <HeroGlobe />
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-3xl border border-cyan-400/30 bg-black/55 p-4 shadow-[0_0_80px_rgba(41,199,255,0.24)] backdrop-blur-xl md:p-6">
            <div className="rounded-2xl border border-white/10 bg-black/70 p-5 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="chart-panel">
                  <p className="panel-label">PCA Projection</p>
                  <div className="h-44 rounded-xl bg-gradient-to-b from-cyan-500/20 to-transparent p-3">
                    <div className="h-full w-full rounded-lg border border-cyan-400/30 bg-[radial-gradient(circle_at_20%_20%,rgba(72,233,255,0.25),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(255,100,210,0.18),transparent_50%),linear-gradient(to_top,rgba(255,255,255,0.05),transparent)]" />
                  </div>
                </div>
                <div className="chart-panel">
                  <p className="panel-label">Cluster Regimes</p>
                  <div className="h-44 rounded-xl border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-cyan-500/10" />
                </div>
                <div className="chart-panel">
                  <p className="panel-label">Model Confidence</p>
                  <div className="h-44 rounded-xl border border-emerald-400/25 bg-gradient-to-t from-emerald-500/15 to-transparent" />
                </div>
                <div className="chart-panel">
                  <p className="panel-label">Signal Momentum</p>
                  <div className="h-44 rounded-xl border border-sky-400/25 bg-gradient-to-t from-sky-500/15 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="screener" className="bg-[#f4f5f7] px-4 py-16 text-slate-900 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Market Screener</h2>
          <p className="mt-3 max-w-3xl text-slate-600 text-lg">
            Find top movers and high-conviction names, then jump directly into PCA and prediction workflows.
          </p>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(2,6,23,0.08)]">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">India</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">All stocks</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Strong buy</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Large cap</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Symbol</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Change</th>
                    <th className="px-5 py-3 font-medium">Sector</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {screenerRows.map((row) => (
                    <tr key={row.symbol} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold">{row.symbol}</td>
                      <td className="px-5 py-4">{row.price} INR</td>
                      <td className="px-5 py-4 text-emerald-600">{row.change}</td>
                      <td className="px-5 py-4 text-slate-600">{row.sector}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => navigate("/app")} className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-700 transition">
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="analysis" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Stock profile</p>
            <h3 className="mt-3 text-4xl font-semibold">HDFC Bank Limited</h3>
            <p className="mt-3 text-emerald-300 text-2xl font-semibold">802.90 INR  +0.94%</p>
            <div className="mt-8 h-56 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(148,163,184,0.08),transparent)]" />
          </article>

          <article className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-300">Financials</p>
            <h3 className="mt-3 text-4xl font-semibold">Performance Snapshot</h3>
            <p className="mt-3 text-white/75">Quarterly metrics, earnings cadence, and conversion efficiency visualized for fast decisions.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="h-24 rounded-xl bg-white/5" />
              <div className="h-24 rounded-xl bg-white/5" />
              <div className="h-24 rounded-xl bg-white/5" />
              <div className="h-24 rounded-xl bg-white/5" />
            </div>
          </article>
        </div>

        <div id="pricing" className="mx-auto mt-12 max-w-7xl rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 p-8 text-center backdrop-blur-xl">
          <h4 className="text-3xl font-semibold">Ready to run live stock intelligence?</h4>
          <p className="mt-2 text-white/75">Jump into your analytics dashboard with one click.</p>
          <button
            onClick={() => navigate("/app")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-black font-semibold"
          >
            Start now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
