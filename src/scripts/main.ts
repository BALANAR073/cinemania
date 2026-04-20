import { apiService } from './services/ApiService';
import { FilmCard } from './components/FilmCard';
import { Pagination } from './components/Pagination';
import { 
  $, 
  show, 
  hide, 
  debounce, 
  updateUrlParams, 
  getUrlParam,
  ErrorManager,
  LoadingManager 
} from './utils/helpers';
import { QueryParams, PaginationState, Film } from './types/index';

class FilmCatalog {
  private currentPage: number = 1;
  private limit: number = 10;
  private sortBy: string = 'popularity.desc';
  private searchQuery: string = '';
  private totalPages: number = 1;
  private totalResults: number = 0;
  
  private filmsGrid: HTMLElement;
  private paginationContainer: HTMLElement;
  private pagination?: Pagination;
  private errorManager: ErrorManager;
  private loadingManager: LoadingManager;
  
  constructor() {
    this.filmsGrid = $('#filmsGrid') as HTMLElement;
    this.paginationContainer = $('#pagination') as HTMLElement;
    this.errorManager = ErrorManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
    
    this.initializeFromUrl();
    this.setupEventListeners();
    this.loadFilms();
  }
  
  private initializeFromUrl(): void {
    const pageParam = getUrlParam('page');
    const limitParam = getUrlParam('limit');
    const sortParam = getUrlParam('sort');
    const searchParam = getUrlParam('search');
    
    if (pageParam) this.currentPage = parseInt(pageParam) || 1;
    if (limitParam) this.limit = parseInt(limitParam) || 10;
    if (sortParam) this.sortBy = sortParam;
    if (searchParam) {
      this.searchQuery = searchParam;
      const searchInput = $('#searchInput') as HTMLInputElement;
      if (searchInput) searchInput.value = searchParam;
    }
    
    const limitSelect = $('#limitSelect') as HTMLSelectElement;
    const sortSelect = $('#sortSelect') as HTMLSelectElement;
    
    if (limitSelect) limitSelect.value = String(this.limit);
    if (sortSelect) sortSelect.value = this.sortBy;
  }
  
  private setupEventListeners(): void {
    const searchInput = $('#searchInput') as HTMLInputElement;
    const searchButton = $('#searchButton');
    
    if (searchInput) {
      const debouncedSearch = debounce(() => {
        this.searchQuery = searchInput.value.trim();
        this.currentPage = 1;
        this.updateUrl();
        this.loadFilms();
      }, 500);
      
      searchInput.addEventListener('input', debouncedSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = searchInput.value.trim();
          this.currentPage = 1;
          this.updateUrl();
          this.loadFilms();
        }
      });
    }
    
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        if (searchInput) {
          this.searchQuery = searchInput.value.trim();
          this.currentPage = 1;
          this.updateUrl();
          this.loadFilms();
        }
      });
    }
    
    const sortSelect = $('#sortSelect') as HTMLSelectElement;
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortBy = sortSelect.value;
        this.currentPage = 1;
        this.updateUrl();
        this.loadFilms();
      });
    }
    
    const limitSelect = $('#limitSelect') as HTMLSelectElement;
    if (limitSelect) {
      limitSelect.addEventListener('change', () => {
        this.limit = parseInt(limitSelect.value);
        this.currentPage = 1;
        this.updateUrl();
        this.loadFilms();
      });
    }
    
    window.addEventListener('loading', ((e: CustomEvent) => {
      this.loadingManager.setLoading(e.detail.isLoading);
    }) as EventListener);
  }
  
  private updateUrl(): void {
    updateUrlParams({
      page: this.currentPage,
      limit: this.limit,
      sort: this.sortBy,
      search: this.searchQuery || null
    });
  }
  
  async loadFilms(): Promise<void> {
    try {
      this.showSkeletons();
      hide('#emptyState');
      
      const params: QueryParams = {
        page: this.currentPage,
        sort_by: this.sortBy
      };
      
      if (this.searchQuery) {
        params.query = this.searchQuery;
      }
      
      const response = await apiService.getFilms(params);
      
      const customFilms = JSON.parse(localStorage.getItem('customFilms') || '[]');
      
      let allFilms: Film[] = [];
      
      if (response.success && response.data) {
        allFilms = [...response.data.data];
        
        if (this.searchQuery) {
          const filteredCustom = customFilms.filter((film: any) => 
            film.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            (film.overview && film.overview.toLowerCase().includes(this.searchQuery.toLowerCase()))
          );
          allFilms = [...filteredCustom, ...allFilms];
        } else {
          allFilms = [...customFilms, ...allFilms];
        }
        
        this.sortFilms(allFilms);
        
        this.totalPages = Math.ceil(allFilms.length / this.limit);
        this.totalResults = allFilms.length;
        
        const start = (this.currentPage - 1) * this.limit;
        const paginatedFilms = allFilms.slice(start, start + this.limit);
        
        this.renderFilms(paginatedFilms);
        this.updatePagination();
        
        if (paginatedFilms.length === 0) {
          show('#emptyState');
        }
      } else {
        this.errorManager.show(response.error || 'Не удалось загрузить фильмы');
      }
    } catch (error) {
      this.errorManager.handleError(error, 'Ошибка при загрузке фильмов');
    }
  }
  
  private sortFilms(films: Film[]): void {
    const [field, order] = this.sortBy.split('.');
    
    films.sort((a: any, b: any) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (field === 'vote_average') {
        aVal = a.rating;
        bVal = b.rating;
      } else if (field === 'title') {
        aVal = a.title;
        bVal = b.title;
      } else if (field === 'release_date') {
        aVal = a.releaseDate;
        bVal = b.releaseDate;
      } else if (field === 'popularity') {
        aVal = a.popularity || 0;
        bVal = b.popularity || 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }
  
  private showSkeletons(): void {
    this.filmsGrid.innerHTML = '';
    for (let i = 0; i < this.limit; i++) {
      this.filmsGrid.appendChild(FilmCard.renderSkeleton());
    }
  }
  
  private renderFilms(films: Film[]): void {
    this.filmsGrid.innerHTML = '';
    
    films.forEach(film => {
      const card = new FilmCard(film);
      this.filmsGrid.appendChild(card.render());
    });
  }
  
  private updatePagination(): void {
    const paginationState: PaginationState = {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      limit: this.limit,
      totalResults: this.totalResults
    };
    
    if (!this.pagination) {
      this.pagination = new Pagination(paginationState, (page: number) => {
        this.currentPage = page;
        this.updateUrl();
        this.loadFilms();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      this.paginationContainer.appendChild(this.pagination.getContainer());
    } else {
      this.pagination.updateState(paginationState);
    }
    
    this.pagination.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const catalog = new FilmCatalog();
  
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
  
  const refreshButton = $('#refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      catalog.loadFilms();
    });
  }
  
  window.addEventListener('filmDeleted', () => {
    catalog.loadFilms();
  });
});