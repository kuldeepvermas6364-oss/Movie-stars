import { useState, useEffect, useMemo } from 'react';
import { Movie, TvShow, tmdbService } from '../services/tmdb';
import HorizontalSlider from '../components/HorizontalSlider';
import { Play, Info, Tv, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import DecisionModal from '../components/DecisionModal';

interface TvSlideItem extends TvShow {
  title: string;
  release_date: string;
  genre_ids: number[];
}

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchlist, history, progress } = useWatchlist();
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickPick = async () => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const res = await tmdbService.getPopular(randomPage);
      if (res.results?.length > 0) {
        const randomMovie = res.results[Math.floor(Math.random() * res.results.length)];
        navigate(`/movie/${randomMovie.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, popularRes, topRatedRes, trendingTvRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
          tmdbService.getTopRated(),
          tmdbService.getTrendingTv(),
        ]);
        setTrending(trendingRes.results || []);
        setPopular(popularRes.results || []);
        setTopRated(topRatedRes.results || []);
        setTrendingTv((trendingTvRes.results || []).map((tv: any) => ({
          ...tv,
          title: tv.name,
          release_date: tv.first_air_date,
          genre_ids: tv.genre_ids ?? [],
          _isTV: true,
        })));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [watchlist.length, history.length]);

  const heroMovie = useMemo(() => trending[0], [trending]);
  const continueWatchingItems = useMemo(() => {
    const items = history.filter(h => progress[h.id]);
    return items.sort((a, b) => progress[b.id].timestamp - progress[a.id].timestamp).slice(0, 10);
  }, [history, progress]);

  return (
    <div className="space-y-8 md:space-y-12 pb-4">
      {!loading && heroMovie && (
        <section className="relative -mx-4 -mt-2 h-[62vh] min-h-[430px] max-h-[650px] md:-mx-8 md:-mt-8 md:h-[80vh] md:min-h-0 md:max-h-none overflow-hidden">
          <img
            src={tmdbService.getImageUrl(heroMovie.backdrop_path, 'original')}
            alt={heroMovie.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/35 to-black/15 md:bg-gradient-to-r md:from-brand-bg md:via-brand-bg/55 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-black/25 md:bg-gradient-to-t md:from-brand-bg/70 md:via-transparent md:to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-5 pb-8 sm:p-7 md:p-12 md:pb-14 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-3 md:space-y-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary text-white text-[10px] md:text-xs font-extrabold tracking-wider rounded-sm shadow-lg">
                  <span className="text-sm leading-none">M</span> MOVIE-STARS ORIGINAL
                </span>
                <span className="text-[10px] md:text-xs text-white/75 font-semibold tracking-widest uppercase">Featured</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-display font-black tracking-tight leading-[1.05] text-white drop-shadow-2xl line-clamp-2">
                {heroMovie.title}
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-gray-200 font-light leading-relaxed max-w-xl drop-shadow-lg line-clamp-3 md:line-clamp-none">
                {heroMovie.overview}
              </p>
              <div className="flex flex-row items-center gap-2.5 pt-2">
                <Link to={`/watch/movie/${heroMovie.id}`} className="bg-white hover:bg-white/90 text-black px-5 py-3 md:px-8 md:py-4 rounded-md font-extrabold flex items-center justify-center gap-2 transition-all shadow-xl text-sm md:text-base">
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <span>Play</span>
                </Link>
                <Link to={`/movie/${heroMovie.id}`} className="bg-white/15 hover:bg-white/25 text-white px-5 py-3 md:px-8 md:py-4 rounded-md font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md border border-white/15 text-sm md:text-base">
                  <Info className="w-4 h-4 md:w-5 md:h-5" />
                  <span>More Info</span>
                </Link>
                <button onClick={handleQuickPick} aria-label="Choose a random movie" className="hidden sm:flex bg-black/35 hover:bg-black/55 backdrop-blur-xl text-white px-5 py-3 rounded-md font-bold items-center justify-center gap-2 transition-all border border-white/15">
                  <Zap className="w-4 h-4 text-brand-primary" />
                  <span>Surprise Me</span>
                </button>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-3 right-5 md:bottom-6 md:right-10 text-[10px] tracking-[0.25em] uppercase text-white/55">Discover your next favourite</div>
        </section>
      )}

      <DecisionModal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} />

      <div className="space-y-9 md:space-y-16">
        {continueWatchingItems.length > 0 && (
          <section className="space-y-3 md:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
                <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight">Continue Watching</h2>
              </div>
            </div>
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto no-scrollbar pb-3">
              {continueWatchingItems.map((item: any) => {
                const prog = progress[item.id];
                const link = prog.type === 'tv'
                  ? `/watch/tv/${item.id}?season=${prog.season}&episode=${prog.episode}`
                  : `/watch/movie/${item.id}`;
                return (
                  <Link key={item.id} to={link} className="shrink-0 w-44 md:w-64 group relative">
                    <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden mb-2 bg-card-bg relative border border-white/5">
                      <img src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'w500')} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-brand-primary transition-colors shadow-xl">
                          <Play className="w-4 h-4 md:w-5 md:h-5 fill-white text-white ml-1" />
                        </div>
                      </div>
                      {prog.type === 'tv' && <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10"><span className="text-[10px] font-bold text-white tracking-widest uppercase">S{prog.season} E{prog.episode}</span></div>}
                    </div>
                    <p className="text-xs md:text-sm font-semibold line-clamp-1 group-hover:text-brand-primary transition-colors">{item.title}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <HorizontalSlider title="Trending Movies" movies={trending} loading={loading} />

        {!loading && trendingTv.length > 0 && (
          <section className="space-y-3 md:space-y-6">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
              <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight">Trending TV Shows</h2>
              <Link to="/tv-shows" className="ml-auto text-xs md:text-sm text-gray-500 hover:text-brand-primary transition-colors font-medium">See All →</Link>
            </div>
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto no-scrollbar pb-3">
              {trendingTv.slice(0, 12).map((tv: any) => (
                <Link key={tv.id} to={`/tv/${tv.id}`} className="shrink-0 w-28 sm:w-36 md:w-40 group">
                  <div className="aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden mb-2 bg-card-bg">
                    <img src={tmdbService.getImageUrl(tv.poster_path, 'w500')} alt={tv.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-[11px] md:text-xs font-semibold line-clamp-1 group-hover:text-brand-primary transition-colors">{tv.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="py-7 md:py-12 bg-white/5 -mx-4 px-4 md:-mx-8 md:px-8 rounded-2xl md:rounded-[4rem] border-y border-white/5">
          <HorizontalSlider title="Critics' Choice" movies={topRated} loading={loading} />
        </section>

        <HorizontalSlider title="Most Popular" movies={popular} loading={loading} />
      </div>
    </div>
  );
}
