import { apiService } from './services/ApiService';
import { FilmModel } from './models/Film';
import { 
  $, 
  show, 
  hide, 
  formatDate, 
  formatCurrency,
  getUrlParam,
  ErrorManager,
  LoadingManager 
} from './utils/helpers';
import { Film } from './types/index';

class FilmDetailsPage {
  private filmId: number | null = null;
  private filmData: Film | null = null;
  private errorManager: ErrorManager;
  private loadingManager: LoadingManager;
  private detailsContainer: HTMLElement;
  
  constructor() {
    this.detailsContainer = $('#filmDetails') as HTMLElement;
    this.errorManager = ErrorManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
    
    this.filmId = this.getFilmIdFromUrl();
    
    if (!this.filmId) {
      this.errorManager.show('ID фильма не указан');
      return;
    }
    
    this.setupEventListeners();
    this.loadFilmDetails();
  }
  
  private getFilmIdFromUrl(): number | null {
    const idParam = getUrlParam('id');
    return idParam ? parseInt(idParam) : null;
  }
  
  private setupEventListeners(): void {
    window.addEventListener('loading', ((e: CustomEvent) => {
      this.loadingManager.setLoading(e.detail.isLoading);
    }) as EventListener);
  }
  
  private async loadFilmDetails(): Promise<void> {
    if (!this.filmId) return;
    
    try {
      const customFilms = JSON.parse(localStorage.getItem('customFilms') || '[]');
      const customFilm = customFilms.find((f: any) => f.id === this.filmId);
      
      if (customFilm) {
        this.filmData = customFilm;
        this.renderFilmDetails();
        show(this.detailsContainer);
        return;
      }
      
      const response = await apiService.getFilmById(this.filmId);
      
      if (response.success && response.data) {
        this.filmData = response.data;
        this.renderFilmDetails();
        show(this.detailsContainer);
      } else {
        this.errorManager.show(response.error || 'Не удалось загрузить информацию о фильме');
      }
    } catch (error) {
      this.errorManager.handleError(error, 'Ошибка при загрузке информации о фильме');
    }
  }
  
  private renderFilmDetails(): void {
    if (!this.filmData) return;
    
    const film = new FilmModel(this.filmData);
    const backdropUrl = film.getBackdropUrl('w1280');
    
    let posterUrl = '/img/default-poster.jpg';
    if (this.filmData.posterPath) {
      if (this.filmData.posterPath.startsWith('http')) {
        posterUrl = this.filmData.posterPath;
      } else {
        posterUrl = film.getPosterUrl('w500');
      }
    }
    
    this.detailsContainer.innerHTML = `
      <div class="film-details__backdrop" style="background-image: url('${backdropUrl}')">
        <div class="film-details__backdrop-overlay"></div>
      </div>
      
      <div class="container">
        <div class="film-details__content">
          <div class="film-details__poster-wrapper">
            <img 
              src="${posterUrl}" 
              alt="${film.title}" 
              class="film-details__poster"
              onerror="this.src='/img/default-poster.jpg'"
            >
          </div>
          
          <div class="film-details__info">
            <h1 class="film-details__title">
              ${film.title}
              ${film.originalTitle !== film.title ? 
                `<span class="film-details__original-title">${film.originalTitle}</span>` : 
                ''
              }
            </h1>
            
            ${film.tagline ? `
              <p class="film-details__tagline">${film.tagline}</p>
            ` : ''}
            
            <div class="film-details__meta">
              ${film.releaseDate ? `
                <span class="film-details__meta-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5A6.5 6.5 0 118 1.5a6.5 6.5 0 010 13z"/>
                    <path d="M8 3v5l3 2"/>
                  </svg>
                  ${formatDate(film.releaseDate)}
                </span>
              ` : ''}
              
              ${film.runtime ? `
                <span class="film-details__meta-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="8" r="7"/>
                    <path d="M8 4v4l3 2" stroke="white" stroke-width="1.5"/>
                  </svg>
                  ${film.getFormattedRuntime()}
                </span>
              ` : ''}
              
              ${film.rating > 0 ? `
                <span class="film-details__meta-item film-details__rating">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1l2.5 5 5.5.8-4 3.9 1 5.3L8 13l-5 1.5 1-5.3-4-3.9 5.5-.8L8 1z"/>
                  </svg>
                  ${film.getFormattedRating()} (${film.voteCount.toLocaleString()} голосов)
                </span>
              ` : ''}
            </div>
            
            ${film.genres.length > 0 ? `
              <div class="film-details__genres">
                ${film.genres.map((genre: string) => 
                  `<span class="film-details__genre">${genre}</span>`
                ).join('')}
              </div>
            ` : ''}
            
            <div class="film-details__description">
              <h3>Сюжет</h3>
              <p>${film.overview || 'Описание отсутствует'}</p>
            </div>
            
            <div class="film-details__credits">
              ${film.director ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">Режиссер:</span>
                  <span class="film-details__credit-value">${film.director}</span>
                </div>
              ` : ''}
              
              ${film.cast.length > 0 ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">В ролях:</span>
                  <span class="film-details__credit-value">${film.cast.join(', ')}</span>
                </div>
              ` : ''}
              
              ${film.productionCompanies.length > 0 ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">Производство:</span>
                  <span class="film-details__credit-value">${film.productionCompanies.join(', ')}</span>
                </div>
              ` : ''}
              
              ${film.productionCountries.length > 0 ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">Страна:</span>
                  <span class="film-details__credit-value">${film.productionCountries.join(', ')}</span>
                </div>
              ` : ''}
              
              ${film.budget > 0 ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">Бюджет:</span>
                  <span class="film-details__credit-value">${formatCurrency(film.budget)}</span>
                </div>
              ` : ''}
              
              ${film.revenue > 0 ? `
                <div class="film-details__credit">
                  <span class="film-details__credit-label">Сборы:</span>
                  <span class="film-details__credit-value">${formatCurrency(film.revenue)}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="film-details__actions">
              ${film.getTrailerUrl() ? `
                <a href="${film.getTrailerUrl()}" target="_blank" class="btn btn--primary">
                  Смотреть трейлер
                </a>
              ` : ''}
              
              ${film.getImdbUrl() ? `
                <a href="${film.getImdbUrl()}" target="_blank" class="btn btn--secondary">
                  IMDb
                </a>
              ` : (film.imdbId ? `
                <a href="${film.imdbId}" target="_blank" class="btn btn--secondary">
                  IMDb
                </a>
              ` : '')}
              
              ${film.homepage ? `
                <a href="${film.homepage}" target="_blank" class="btn btn--secondary">
                  Официальный сайт
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FilmDetailsPage();
  
  const mobileMenuBtn = $('.header__mobile-menu');
  const nav = $('.header__nav');
  
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('header__nav--active');
      mobileMenuBtn.classList.toggle('header__mobile-menu--active');
    });
  }
  
  const popularLink = $('#popularLink');
  if (popularLink) {
    popularLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/';
    });
  }
  
  const aboutLink = $('#aboutLink');
  const aboutModal = $('#aboutModal') as HTMLElement;
  if (aboutLink && aboutModal) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      show(aboutModal);
    });
    
    const closeBtn = aboutModal.querySelector('.modal__close') as HTMLElement;
    const okBtn = aboutModal.querySelector('.modal__ok') as HTMLElement;
    
    if (closeBtn) closeBtn.addEventListener('click', () => hide(aboutModal));
    if (okBtn) okBtn.addEventListener('click', () => hide(aboutModal));
    
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) hide(aboutModal);
    });
  }
});