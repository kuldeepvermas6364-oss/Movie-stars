import { useState, useEffect, useMemo } from 'react';
import { Movie, TvShow, Genre, tmdbService } from '../services/tmdb';
import HorizontalSlider from '../components/HorizontalSlider';
import {
  Play, Info, Tv, Clock, Trophy, ChevronLeft, ChevronRight,
  Sparkles, Star, Flame, Clapperboard
} from 'lucide-react';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import DecisionModal from '../components/DecisionModal';

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<any[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const { history, progress } = useWatchlist();
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickPick = async () => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const res = await tmdbService.getPopular(randomPage);
      if (res.results?.length) {
        const randomMovie = res.results[Math.floor(Math.random() * res.results.length)];
        navigate('/movie/' + randomMovie.id);
      }
    } catch (error) {
      console.error('Unable to pick a movie:', error);
    }
  };

  useEffect(() => {
    let active = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [trendingRes, popularRes, topRatedRes, trendingTvRes, genreRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
          tmdbService.getTopRated(),
          tmdbService.getTrendingTv(),
          tmdbService.getGenres(),
        ]);
        if (!active) return;
        setTrending(trendingRes.results || []);
        setPopular(popularRes.results || []);
        setTopRated(topRatedRes.results || []);
        setTrendingTv((trendingTvRes.results || []).map((tv: TvShow) => ({
          ...tv,
          title: tv.name,
          release_date: tv.first_air_date,
          genre_ids: tv.genre_ids ?? [],
        })));
        setGenres(genreRes || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => { active = false; };
  }, []);

  const heroMovies = useMemo(
    () => trending.filter(movie => movie.backdrop_path).slice(0, 6),
    [trending]
  );
  const heroMovie = heroMovies[heroIndex] || trending[0];

  useEffect(() => {
    if (heroMovies.length < 2 || isHeroPaused) return;
    const timer = window.setInterval(() => {
      setHeroIndex(current => (current + 1) % heroMovies.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroMovies.length, isHeroPaused]);

  const continueWatchingItems = useMemo(() => (
    history
      .filter(item => progress[item.id])
      .sort((a, b) => progress[b.id].timestamp - progress[a.id].timestamp)
      .slice(0, 10)
  ), [history, progress]);

  const changeHero = (direction: number) => {
    if (!heroMovies.length) return;
    setHeroIndex(current => (current + direction + heroMovies.length) % heroMovies.length);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 md:space-y-10 pb-5">
      <DecisionModal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} />

      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">Welcome to your cinema</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-display font-black tracking-tight text-white">Discover</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/leaderboard" aria-label="Community leaderboard" title="Leaderboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:border-yellow-300/40 hover:text-yellow-300">
            <Trophy className="h-[18px] w-[18px]" />
          </Link>
          <button onClick={handleQuickPick} className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary-hover">
            <Sparkles className="h-4 w-4" /> Surprise Me
          </button>
        </div>
      </div>

      <nav aria-label="Discover categories" className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="shrink-0 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-white">For You</span>
        <Link to="/browse" className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">Movies</Link>
        <Link to="/tv-shows" className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">TV Shows</Link>
        <Link to="/browse" className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">Anime</Link>
        <Link to="/browse" className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">Genres</Link>
      </nav>

      <section
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onFocus={() => setIsHeroPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsHeroPaused(false);
        }}
        className="relative -mx-4 md:mx-0 h-[58vh] min-h-[430px] max-h-[690px] overflow-hidden bg-card-bg md:rounded-3xl md:border md:border-white/10"
      >
        {heroMovie ? (
          <>
            <motion.img
              key={heroMovie.id}
              initial={{ opacity: 0.25, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              src={tmdbService.getImageUrl(heroMovie.backdrop_path, 'original')}
              alt={heroMovie.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/20" />
            <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between md:left-9 md:right-9 md:top-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Flame className="h-3.5 w-3.5 text-brand-primary" /> Trending now
              </span>
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white/75 backdrop-blur">Featured</span>
            </div>
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 pb-14 sm:p-8 sm:pb-16 md:p-12 md:pb-16">
              <motion.div key={heroMovie.id + '-details'} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-3 md:space-y-5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                  <span className="rounded bg-brand-primary px-2 py-1 text-white">Movie-Stars</span>
                  <span>{heroMovie.release_date?.slice(0, 4) || 'Featured'}</span>
                  {heroMovie.vote_average > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {heroMovie.vote_average.toFixed(1)}</span>}
                </div>
                <h2 className="line-clamp-2 text-3xl font-display font-black leading-[1.04] tracking-tight text-white drop-shadow-2xl sm:text-4xl md:text-6xl">{heroMovie.title}</h2>
                <p className="line-clamp-2 max-w-xl text-xs leading-6 text-white/75 sm:text-sm md:text-base">{heroMovie.overview}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to={'/watch/movie/' + heroMovie.id} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-black transition hover:bg-white/85">
                    <Play className="h-4 w-4 fill-current" /> Watch Now
                  </Link>
                  <Link to={'/movie/' + heroMovie.id} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
                    <Info className="h-4 w-4" /> Details
                  </Link>
                </div>
              </motion.div>
            </div>
            {heroMovies.length > 1 && (
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 md:bottom-8 md:right-8">
                <span className="mr-1 text-[10px] font-bold text-white/65">{heroIndex + 1} / {heroMovies.length}</span>
                <button onClick={() => changeHero(-1)} aria-label="Previous featured title" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur hover:bg-white/15"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => changeHero(1)} aria-label="Next featured title" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur hover:bg-white/15"><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 shimmer" />
        )}
      </section>

      {continueWatchingItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-primary" />
            <h2 className="text-lg font-display font-bold text-white md:text-xl">Continue Watching</h2>
            <Link to="/history" className="ml-auto text-xs font-semibold text-white/45 hover:text-white">View all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {continueWatchingItems.map((item: any) => {
              const prog = progress[item.id];
              const link = prog.type === 'tv'
                ? '/watch/tv/' + item.id + '?season=' + prog.season + '&episode=' + prog.episode
                : '/watch/movie/' + item.id;
              return (
                <Link key={item.id} to={link} className="group w-52 shrink-0 sm:w-60">
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-xl border border-white/10 bg-card-bg">
                    <img src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'w500')} alt={item.title} loading="lazy" className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"><Play className="ml-0.5 h-4 w-4 fill-current" /></span></div>
                    {prog.type === 'tv' && <span className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-[9px] font-bold text-white">S{prog.season} E{prog.episode}</span>}
                  </div>
                  <p className="truncate text-xs font-semibold text-white/85 group-hover:text-white">{item.title}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <HorizontalSlider title="Trending Movies" movies={trending} loading={loading} />

      {!loading && trendingTv.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-brand-primary" />
            <h2 className="text-lg font-display font-bold text-white md:text-xl">Popular TV Shows</h2>
            <Link to="/tv-shows" className="ml-auto text-xs font-semibold text-white/45 hover:text-white">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {trendingTv.slice(0, 12).map((tv: any) => (
              <Link key={tv.id} to={'/tv/' + tv.id} className="group w-28 shrink-0 sm:w-36 md:w-40">
                <div className="mb-2 aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-card-bg">
                  <img src={tmdbService.getImageUrl(tv.poster_path, 'w500')} alt={tv.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <p className="truncate text-xs font-semibold text-white/80 group-hover:text-white">{tv.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <HorizontalSlider title="Top Rated Movies" movies={topRated} loading={loading} />
      <HorizontalSlider title="Popular Right Now" movies={popular} loading={loading} />

      {!loading && genres.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-brand-primary" />
            <h2 className="text-lg font-display font-bold text-white md:text-xl">Browse by Genre</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {genres.slice(0, 12).map((genre, index) => (
              <Link key={genre.id} to="/browse" className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 transition hover:border-brand-primary/40 hover:bg-white/[0.07]">
                <span className="text-sm font-semibold text-white/75 group-hover:text-white">{genre.name}</span>
                <span className="text-[10px] font-bold text-white/25">0{index + 1}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
