// TMDB API типы
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
  original_language: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number | null;
  status: string;
  tagline: string | null;
  budget: number;
  revenue: number;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  imdb_id: string | null;
  homepage: string | null;
  belongs_to_collection: TMDBCollection | null;
  credits: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
  videos: {
    results: TMDBVideo[];
  };
  images: {
    backdrops: TMDBImage[];
    posters: TMDBImage[];
    logos: TMDBImage[];
  };
  recommendations: {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
  };
  similar: {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
  };
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TMDBCast {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TMDBCrew {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieResponse extends TMDBResponse<TMDBMovie> {}

// Внутренние типы приложения
export interface Film {
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  with_genres?: string;
  query?: string;
  year?: number;
  language?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalResults: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SortOption {
  value: string;
  label: string;
}