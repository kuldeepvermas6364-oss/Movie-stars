import { useState, useEffect, useMemo } from 'react';
import { Movie, TvShow, Genre, tmdbService } from '../services/tmdb';
import HorizontalSlider from '../components/HorizontalSlider';
import {
  Play, Info, Tv, Zap, Clock, Trophy, ChevronLeft, ChevronRight,
  Clapperboard, Star, Film, Sparkles, BarChart3, ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import DecisionModal from '../components/DecisionModal';

interface MovieClip {
  id: number;
  movieTitle: string;
  movieId: number;
  key: string;
  name: string;
  type: string;
}

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<any[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movieClips, setMovieClips] = useState<MovieClip[]>([]);
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
      if (res.results?.length > 0) {
        const randomMovie = res.results[Math.floor(Math.random() * res.results.length)];
        navigate('/movie/' + randomMovie.id);
      }
    } catch (e) {
      console.error(e);
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
    }, 6500);
    return () => window.clearInterval(timer);
  }, [heroMovies.length, isHeroPaused]);

  useEffect(() => {
    let active = true;
    if (!trending.length) return;
    async function fetchClips() {
      try {
        const details = await Promise.allSettled(
          trending.slice(0, 6).map(movie => tmdbService.getMovieDetails(movie.id))
        );
        if (!active) return;
        const clips: MovieClip[] = [];
        details.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          const movie = trending[index];
          const videos = result.value?.videos?.results || [];
          videos
            .filter((video: any) =>
              video.site === 'YouTube' &&
              ['Clip', 'Teaser', 'Trailer', 'Featurette'].includes(video.type) &&
              video.key
            )
            .slice(0, 2)
            .forEach((video: any) => clips.push({
              id: video.id || video.key,
              movieTitle: movie.title,
              movieId: movie.id,
              key: video.key,
              name: video.name,
              type: video.type,
            }));
        });
        setMovieClips(clips.slice(0, 10));
      } catch (error) {
        console.error('Error fetching movie clips:', error);
      }
    }
    fetchClips();
    return () => { active = false; };
  }, [trending]);

  const continueWatchingItems = useMemo(() => {
    return history
      .filter(item => progress[item.id])
      .sort((a, b) => progress[b.id].timestamp - progress[a.id].timestamp)
      .slice(0, 10);
  }, [history, progress]);

  const changeHero = (direction: number) => {
    if (!heroMovies.length) return;
    setHeroIndex(current => (current + direction + heroMovies.length) % heroMovies.length);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-4">
      <section
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onFocus={() => setIsHeroPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsHeroPaused(false);
        }}
        className="relative -mx-4 -mt-2 h-[64vh] min-h-[470px] max-h-[720px] md:-mx-8 md:-mt-8 md:h-[78vh] md:min-h-[590px] md:max-h-[850px] overflow-hidden bg-card-bg"
      >
        {heroMovie ? (
          <>
            <motion.img
              key={heroMovie.id}
              initial={{ opacity: 0.35, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65 }}
              src={tmdbService.getImageUrl(heroMovie.backdrop_path, 'original')}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/45 to-black/15 md:bg-gradient-to-r md:from-brand-bg md:via-brand-bg/65 md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-black/30" />
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-2">
              <Link to="/leaderboard" className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-black/55 px-3.5 py-2.5 text-xs md:text-sm font-bold text-white shadow-xl backdrop-blur-xl transition hover:bg-yellow-400/15">
                <Trophy className="h-4 w-4 text-yellow-300" />
                <span>Leaderboard</span>
              </Link>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-5 pb-10 sm:p-7 md:p-12 md:pb-16 z-10">
              <motion.div key={heroMovie.id + '-copy'} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-3 md:space-y-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary text-white text-[10px] md:text-xs font-extrabold tracking-wider rounded-sm shadow-lg">
                    <span className="text-sm leading-none">M</span> MOVIE-STARS PICK
                  </span>
                  <span className="text-[10px] md:text-xs text-white/75 font-semibold tracking-widest uppercase">Featured today</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-7xl font-display font-black tracking-tight leading-[1.05] text-white drop-shadow-2xl line-clamp-2">
                  {heroMovie.title}
                </h1>
                <p className="text-sm sm:text-base md:text-xl text-gray-200 font-light leading-relaxed max-w-xl drop-shadow-lg line-clamp-3 md:line-clamp-4">
                  {heroMovie.overview}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Link to={'/watch/movie/' + heroMovie.id} className="bg-white hover:bg-white/90 text-black px-5 py-3 md:px-8 md:py-4 rounded-md font-extrabold flex items-center justify-center gap-2 transition-all shadow-xl text-sm md:text-base">
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    <span>Play</span>
                  </Link>
                  <Link to={'/movie/' + heroMovie.id} className="bg-white/15 hover:bg-white/25 text-white px-5 py-3 md:px-8 md:py-4 rounded-md font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md border border-white/15 text-sm md:text-base">
                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                    <span>More Info</span>
                  </Link>
                  <button onClick={handleQuickPick} className="hidden sm:flex bg-black/35 hover:bg-black/55 backdrop-blur-xl text-white px-5 py-3 rounded-md font-bold items-center justify-center gap-2 transition-all border border-white/15">
                    <Zap className="w-4 h-4 text-brand-primary" />
                    <span>Surprise Me</span>
                  </button>
                </div>
              </motion.div>
            </div>
            {heroMovies.length > 1 && (
              <div className="absolute bottom-4 right-5 md:bottom-7 md:right-10 z-20 flex items-center gap-2">
                <span className="mr-2 text-[10px] font-bold tracking-widest text-white/65">{String(heroIndex + 1).padStart(2, '0')} / {String(heroMovies.length).padStart(2, '0')}</span>
                <button onClick={() => changeHero(-1)} aria-label="Previous featured movie" className="h-9 w-9 rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/15"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => changeHero(1)} aria-label="Next featured movie" className="h-9 w-9 rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/15"><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 shimmer" />
        )}
      </section>

      <DecisionModal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} />

      <div className="space-y-9 md:space-y-14">
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-yellow-300/15 bg-gradient-to-br from-[#24190d] via-[#17131a] to-[#101116] p-5 sm:p-6 md:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-yellow-300">
                <Trophy className="h-5 w-5" />
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.24em]">Movie-stars community</span>
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-display font-black text-white">Your movie journey deserves a spotlight.</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Check the community leaderboard and explore your personal viewing stats. Rankings only show when real verified data is available.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/leaderboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 text-sm font-extrabold text-[#17120b] transition hover:bg-yellow-200">
                <Trophy className="h-4 w-4" /> Leaderboard <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/stats" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                <BarChart3 className="h-4 w-4" /> My Stats
              </Link>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Trophy className="h-5 w-5 text-yellow-300" />
              <p className="mt-2 text-sm font-bold text-white">Leaderboard</p>
              <p className="mt-1 text-[11px] text-white/45">Community rankings</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Star className="h-5 w-5 text-yellow-300" />
              <p className="mt-2 text-sm font-bold text-white">Achievements</p>
              <p className="mt-1 text-[11px] text-white/45">Your viewing milestones</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              <p className="mt-2 text-sm font-bold text-white">Challenges</p>
              <p className="mt-1 text-[11px] text-white/45">Coming soon</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Film className="h-5 w-5 text-brand-primary" />
              <p className="mt-2 text-sm font-bold text-white">Rewards</p>
              <p className="mt-1 text-[11px] text-white/45">Coming soon</p>
            </div>
          </div>
        </section>

        {movieClips.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-brand-primary">
                  <Clapperboard className="h-5 w-5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]">Quick watch</span>
                </div>
                <h2 className="mt-1 text-xl md:text-2xl font-display font-bold tracking-tight text-white">Movie Shorts & Clips</h2>
                <p className="mt-1 text-xs md:text-sm text-white/45">Official clips, teasers and trailers from YouTube.</p>
              </div>
              <span className="text-xs font-semibold text-white/40">{movieClips.length} clips</span>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-3">
              {movieClips.map((clip) => (
                <a
                  key={clip.id}
                  href={'https://www.youtube.com/watch?v=' + clip.key}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative shrink-0 w-[145px] sm:w-[170px] md:w-[190px]"
                  aria-label={'Watch ' + clip.name + ' on YouTube'}
                >
                  <div className="relative aspect-[9/14] overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-card-bg">
                    <img src={'https://img.youtube.com/vi/' + clip.key + '/hqdefault.jpg'} alt={clip.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-brand-primary"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>
                    </div>
                    <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white/90 backdrop-blur">{clip.type}</span>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs font-bold leading-snug text-white line-clamp-2">{clip.movieTitle}</p>
                      <p className="mt-1 text-[10px] text-white/55 line-clamp-1">{clip.name}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {continueWatchingItems.length > 0 && (
          <section className="space-y-3 md:space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
              <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight">Continue Watching</h2>
            </div>
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto no-scrollbar pb-3">
              {continueWatchingItems.map((item: any) => {
                const prog = progress[item.id];
                const link = prog.type === 'tv'
                  ? '/watch/tv/' + item.id + '?season=' + prog.season + '&episode=' + prog.episode
                  : '/watch/movie/' + item.id;
                return (
                  <Link key={item.id} to={link} className="shrink-0 w-44 md:w-64 group relative">
                    <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden mb-2 bg-card-bg relative border border-white/5">
                      <img src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'w500')} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
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
          <section className="space-y-3 md:space-y-5">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
              <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight">Trending TV Shows</h2>
              <Link to="/tv-shows" className="ml-auto text-xs md:text-sm text-gray-500 hover:text-brand-primary transition-colors font-medium">See All →</Link>
            </div>
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto no-scrollbar pb-3">
              {trendingTv.slice(0, 12).map((tv: any) => (
                <Link key={tv.id} to={'/tv/' + tv.id} className="shrink-0 w-28 sm:w-36 md:w-40 group">
                  <div className="aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden mb-2 bg-card-bg">
                    <img src={tmdbService.getImageUrl(tv.poster_path, 'w500')} alt={tv.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-[11px] md:text-xs font-semibold line-clamp-1 group-hover:text-brand-primary transition-colors">{tv.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="py-6 md:py-10 bg-white/5 -mx-4 px-4 md:-mx-8 md:px-8 rounded-2xl md:rounded-[3rem] border-y border-white/5">
          <HorizontalSlider title="Top Rated Movies" movies={topRated} loading={loading} />
        </section>

        <HorizontalSlider title="Most Popular" movies={popular} loading={loading} />

        {!loading && genres.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-brand-primary" />
              <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight text-white">Explore by Genre</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {genres.slice(0, 12).map((genre, index) => (
                <Link
                  key={genre.id}
                  to="/browse"
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 md:p-5 transition hover:border-brand-primary/50 hover:bg-white/[0.07]"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">0{index + 1}</span>
                  <p className="mt-2 text-base md:text-lg font-display font-bold text-white group-hover:text-brand-primary transition-colors">{genre.name}</p>
                  <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-white/35 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-primary" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
