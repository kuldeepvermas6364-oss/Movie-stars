import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock3, Film, Sparkles } from 'lucide-react';

export default function Leaderboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Home</Link>
        <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">Community</span>
      </div>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#29150d] via-[#171116] to-[#0d0e14] p-6 md:p-10">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-400/10"><Trophy className="h-7 w-7 text-yellow-300" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300/80">Movie-stars</p><h1 className="mt-1 text-3xl font-display font-black text-white md:text-4xl">Leaderboard</h1></div>
        </div>
        <p className="relative mt-5 max-w-2xl text-sm leading-6 text-white/65 md:text-base">Discover the community’s biggest movie and TV fans. Rankings will appear here once verified, account-wide viewing data is connected.</p>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-brand-primary" /><h2 className="text-lg font-bold text-white">Rankings are being prepared</h2></div>
        <p className="mt-2 text-sm leading-6 text-white/55">No sample names or made-up scores are shown. A real leaderboard needs shared user accounts and trusted watch-time and viewing totals, not just this device’s local watch history.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4"><Clock3 className="h-5 w-5 text-yellow-300" /><div><p className="text-sm font-semibold text-white">Watch time</p><p className="text-xs text-white/45">Verified minutes watched</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4"><Film className="h-5 w-5 text-brand-primary" /><div><p className="text-sm font-semibold text-white">Titles watched</p><p className="text-xs text-white/45">Movies and shows completed</p></div></div>
        </div>
      </section>
    </div>
  );
}
