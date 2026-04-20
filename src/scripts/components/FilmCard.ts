import { Film } from '../types/index';
import { truncateText } from '../utils/helpers';
import { API_CONFIG } from '../api.config';

export class FilmCard {
  private film: Film;
  
  constructor(film: Film) {
    this.film = film;
  }
  
  render(): HTMLElement {
    const card = document.createElement('article');
    card.className = 'film-card';
    card.setAttribute('data-film-id', String(this.film.id));
    
    let posterUrl = '/img/default-poster.jpg';
    if (this.film.posterPath) {
      if (this.film.posterPath.startsWith('http')) {
        posterUrl = this.film.posterPath;
      } else {
        posterUrl = `${API_CONFIG.TMDB_IMAGE_BASE_URL}/w500${this.film.posterPath}`;
      }
    }
    
    const rating = this.film.rating || 0;
    const year = this.film.releaseYear || 'Год не указан';
    const isCustomFilm = this.film.id > 1000000000;
    
    card.innerHTML = `
      <a href="/film-details.html?id=${this.film.id}" class="film-card__link">
        <div class="film-card__poster">
          <img 
            src="${posterUrl}" 
            alt="${this.film.title}" 
            class="film-card__image"
            loading="lazy"
            onerror="this.src='/img/default-poster.jpg'"
          >
          ${rating > 0 ? `
            <div class="film-card__rating">
              <span class="film-card__rating-value">${rating.toFixed(1)}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="film-card__content">
          <h3 class="film-card__title">${this.film.title}</h3>
          
          <div class="film-card__meta">
            <span class="film-card__year">${year}</span>
            ${this.film.genres && this.film.genres.length > 0 ? `
              <span class="film-card__genres">${this.film.genres.slice(0, 2).join(', ')}</span>
            ` : ''}
          </div>
          
          ${this.film.overview ? `
            <p class="film-card__description">
              ${truncateText(this.film.overview, 120)}
            </p>
          ` : ''}
          
          <div class="film-card__footer">
            ${this.film.voteCount ? `
              <span class="film-card__votes">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l2.5 5 5.5.8-4 3.9 1 5.3L8 13l-5 1.5 1-5.3-4-3.9 5.5-.8L8 1z"/>
                </svg>
                ${this.film.voteCount.toLocaleString()}
              </span>
            ` : ''}
            <span class="film-card__details-link">Подробнее →</span>
          </div>
        </div>
      </a>
      ${isCustomFilm ? `
        <button class="film-card__delete" data-id="${this.film.id}" aria-label="Удалить фильм">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 1a.5.5 0 01.5.5v1h4v-1a.5.5 0 011 0v1h1a1 1 0 011 1v1H3v-1a1 1 0 011-1h1v-1a.5.5 0 01.5-.5zM3 6h10v7a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm2 2v4h1V8H5zm3 0v4h1V8H8zm3 0v4h1V8h-1z"/>
          </svg>
        </button>
      ` : ''}
    `;
    
    if (isCustomFilm) {
      const deleteBtn = card.querySelector('.film-card__delete') as HTMLElement;
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
            const customFilms = JSON.parse(localStorage.getItem('customFilms') || '[]');
            const updatedFilms = customFilms.filter((f: any) => f.id !== this.film.id);
            localStorage.setItem('customFilms', JSON.stringify(updatedFilms));
            window.dispatchEvent(new CustomEvent('filmDeleted'));
          }
        });
      }
    }
    
    return card;
  }
  
  static renderSkeleton(): HTMLElement {
    const card = document.createElement('article');
    card.className = 'film-card film-card--skeleton';
    
    card.innerHTML = `
      <div class="film-card__poster skeleton"></div>
      <div class="film-card__content">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text skeleton--text-short"></div>
      </div>
    `;
    
    return card;
  }
}