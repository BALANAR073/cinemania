import { Film as FilmInterface, TMDBMovie, TMDBMovieDetails } from '../types/index';
import { API_CONFIG } from '../api.config';

export class FilmModel implements FilmInterface {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  releaseYear: number;
  rating: number;
  voteCount: number;
  popularity: number;
  genres: string[];
  runtime: number | null;
  director: string;
  cast: string[];
  trailerKey: string | null;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdbId: string | null;
  status: string;
  tagline: string | null;
  productionCompanies: string[];
  productionCountries: string[];
  language: string;

  constructor(data: Partial<FilmInterface>) {
    this.id = data.id || 0;
    this.title = data.title || '';
    this.originalTitle = data.originalTitle || '';
    this.overview = data.overview || '';
    this.posterPath = data.posterPath || null;
    this.backdropPath = data.backdropPath || null;
    this.releaseDate = data.releaseDate || '';
    this.releaseYear = data.releaseYear || new Date().getFullYear();
    this.rating = data.rating || 0;
    this.voteCount = data.voteCount || 0;
    this.popularity = data.popularity || 0;
    this.genres = data.genres || [];
    this.runtime = data.runtime || null;
    this.director = data.director || '';
    this.cast = data.cast || [];
    this.trailerKey = data.trailerKey || null;
    this.budget = data.budget || 0;
    this.revenue = data.revenue || 0;
    this.homepage = data.homepage || null;
    this.imdbId = data.imdbId || null;
    this.status = data.status || '';
    this.tagline = data.tagline || null;
    this.productionCompanies = data.productionCompanies || [];
    this.productionCountries = data.productionCountries || [];
    this.language = data.language || '';
  }

  static fromTMDBMovie(movie: TMDBMovie, genres: string[] = []): FilmModel {
    const releaseYear = movie.release_date 
      ? new Date(movie.release_date).getFullYear() 
      : 0;

    return new FilmModel({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      releaseYear,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      genres,
      language: movie.original_language
    });
  }

  static fromTMDBDetails(details: TMDBMovieDetails): FilmModel {
    const releaseYear = details.release_date 
      ? new Date(details.release_date).getFullYear() 
      : 0;

    const director = details.credits.crew.find(
      (member: any) => member.job === 'Director'
    )?.name || 'Unknown';

    const cast = details.credits.cast
      .slice(0, 10)
      .map((actor: any) => actor.name);

    const trailer = details.videos.results.find(
      (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    return new FilmModel({
      id: details.id,
      title: details.title,
      originalTitle: details.original_title,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      releaseDate: details.release_date,
      releaseYear,
      rating: details.vote_average,
      voteCount: details.vote_count,
      popularity: details.popularity,
      genres: details.genres.map((g: any) => g.name),
      runtime: details.runtime,
      director,
      cast,
      trailerKey: trailer?.key || null,
      budget: details.budget,
      revenue: details.revenue,
      homepage: details.homepage,
      imdbId: details.imdb_id,
      status: details.status,
      tagline: details.tagline,
      productionCompanies: details.production_companies.map((c: any) => c.name),
      productionCountries: details.production_countries.map((c: any) => c.name),
      language: details.original_language
    });
  }

  getPosterUrl(size: 'w200' | 'w300' | 'w400' | 'w500' | 'original' = 'w500'): string {
    const baseUrl = API_CONFIG.TMDB_IMAGE_BASE_URL;
    return this.posterPath 
      ? `${baseUrl}/${size}${this.posterPath}`
      : '/img/default-poster.jpg';
  }

  getBackdropUrl(size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    const baseUrl = API_CONFIG.TMDB_IMAGE_BASE_URL;
    return this.backdropPath 
      ? `${baseUrl}/${size}${this.backdropPath}`
      : '/img/hero-bg.jpg';
  }

  getFormattedRuntime(): string {
    if (!this.runtime) return 'N/A';
    const hours = Math.floor(this.runtime / 60);
    const minutes = this.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  getFormattedBudget(): string {
    return this.budget > 0 
      ? `$${(this.budget / 1000000).toFixed(1)}M`
      : 'N/A';
  }

  getFormattedRevenue(): string {
    return this.revenue > 0 
      ? `$${(this.revenue / 1000000).toFixed(1)}M`
      : 'N/A';
  }

  getFormattedRating(): string {
    return this.rating.toFixed(1);
  }

  getRatingPercentage(): number {
    return Math.round(this.rating * 10);
  }

  getTrailerUrl(): string | null {
    return this.trailerKey 
      ? `https://www.youtube.com/watch?v=${this.trailerKey}`
      : null;
  }

  getImdbUrl(): string | null {
    return this.imdbId 
      ? `https://www.imdb.com/title/${this.imdbId}`
      : null;
  }

  toJSON(): FilmInterface {
    return {
      id: this.id,
      title: this.title,
      originalTitle: this.originalTitle,
      overview: this.overview,
      posterPath: this.posterPath,
      backdropPath: this.backdropPath,
      releaseDate: this.releaseDate,
      releaseYear: this.releaseYear,
      rating: this.rating,
      voteCount: this.voteCount,
      popularity: this.popularity,
      genres: this.genres,
      runtime: this.runtime,
      director: this.director,
      cast: this.cast,
      trailerKey: this.trailerKey,
      budget: this.budget,
      revenue: this.revenue,
      homepage: this.homepage,
      imdbId: this.imdbId,
      status: this.status,
      tagline: this.tagline,
      productionCompanies: this.productionCompanies,
      productionCountries: this.productionCountries,
      language: this.language
    };
  }
}