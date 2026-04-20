import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  TMDBMovieResponse, 
  TMDBMovieDetails, 
  ApiResponse, 
  Film, 
  QueryParams,
  Genre 
} from '../types/index';
import { FilmModel } from '../models/Film';
import { API_CONFIG } from '../api.config';

export class ApiService {
  private client: AxiosInstance;
  private genres: Genre[] = [];
  private genresLoaded: boolean = false;

  constructor() {
    const baseURL = API_CONFIG.TMDB_BASE_URL;
    const apiKey = API_CONFIG.TMDB_API_KEY;

    this.client = axios.create({
      baseURL,
      params: {
        api_key: apiKey,
        language: 'ru-RU'
      }
    });

    this.client.interceptors.request.use((config: any) => {
      this.dispatchLoadingEvent(true);
      return config;
    });

    this.client.interceptors.response.use(
      (response: any) => {
        this.dispatchLoadingEvent(false);
        return response;
      },
      (error: any) => {
        this.dispatchLoadingEvent(false);
        return Promise.reject(error);
      }
    );
  }

  private dispatchLoadingEvent(isLoading: boolean): void {
    window.dispatchEvent(new CustomEvent('loading', { 
      detail: { isLoading } 
    }));
  }

  private async loadGenres(): Promise<void> {
    if (this.genresLoaded) return;

    try {
      const response = await this.client.get('/genre/movie/list');
      this.genres = response.data.genres;
      this.genresLoaded = true;
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  }

  private mapGenres(genreIds: number[]): string[] {
    return genreIds
      .map(id => this.genres.find(g => g.id === id)?.name || '')
      .filter(name => name !== '');
  }

  async getFilms(params: QueryParams = {}): Promise<ApiResponse<{ 
    data: Film[]; 
    totalPages: number; 
    totalResults: number;
    page: number;
  }>> {
    try {
      await this.loadGenres();

      const queryParams: any = {
        page: params.page || 1,
        language: params.language || 'ru-RU',
        include_adult: false,
        include_video: false
      };

      let endpoint = '/discover/movie';
      
      if (params.query) {
        endpoint = '/search/movie';
        queryParams.query = params.query;
      }

      if (params.with_genres) {
        queryParams.with_genres = params.with_genres;
      }

      if (params.year) {
        queryParams.primary_release_year = params.year;
      }

      if (params.sort_by) {
        queryParams.sort_by = params.sort_by;
      } else {
        queryParams.sort_by = 'popularity.desc';
      }

      const response = await this.client.get<TMDBMovieResponse>(endpoint, { 
        params: queryParams 
      });

      const films = response.data.results.map((movie: any) => 
        FilmModel.fromTMDBMovie(movie, this.mapGenres(movie.genre_ids)).toJSON()
      );

      return {
        success: true,
        data: {
          data: films,
          totalPages: response.data.total_pages,
          totalResults: response.data.total_results,
          page: response.data.page
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFilmById(id: number): Promise<ApiResponse<Film>> {
    try {
      const response = await this.client.get<TMDBMovieDetails>(`/movie/${id}`, {
        params: {
          append_to_response: 'credits,videos,images,recommendations,similar'
        }
      });

      const film = FilmModel.fromTMDBDetails(response.data);
      
      return {
        success: true,
        data: film.toJSON()
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getGenres(): Promise<ApiResponse<Genre[]>> {
    try {
      await this.loadGenres();
      return {
        success: true,
        data: this.genres
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<{ 
    data: Film[]; 
    totalPages: number; 
    totalResults: number;
    page: number;
  }>> {
    try {
      await this.loadGenres();

      const response = await this.client.get<TMDBMovieResponse>(
        `/trending/movie/${timeWindow}`,
        { params: { page: 1 } }
      );

      const films = response.data.results.map((movie: any) => 
        FilmModel.fromTMDBMovie(movie, this.mapGenres(movie.genre_ids)).toJSON()
      );

      return {
        success: true,
        data: {
          data: films,
          totalPages: response.data.total_pages,
          totalResults: response.data.total_results,
          page: response.data.page
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        statusCode: axiosError.response?.status
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const apiService = new ApiService();