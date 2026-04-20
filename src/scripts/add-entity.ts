import { 
  $, 
  show, 
  hide, 
  validateForm,
  ErrorManager,
  LoadingManager 
} from './utils/helpers';

class AddEntityPage {
  private form: HTMLFormElement;
  private successModal: HTMLElement;
  private errorModal: HTMLElement;
  private errorManager: ErrorManager;
  private loadingManager: LoadingManager;
  
  constructor() {
    this.form = $('#addFilmForm') as HTMLFormElement;
    this.successModal = $('#successModal') as HTMLElement;
    this.errorModal = $('#errorModal') as HTMLElement;
    this.errorManager = ErrorManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
    
    this.setupEventListeners();
    this.setupModals();
  }
  
  private setupEventListeners(): void {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }
  
  private setupModals(): void {
    const modals = [this.successModal, this.errorModal];
    
    modals.forEach(modal => {
      if (!modal) return;
      
      const closeBtn = modal.querySelector('.modal__close');
      const okBtn = modal.querySelector('.modal__ok');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => hide(modal));
      }
      
      if (okBtn) {
        okBtn.addEventListener('click', () => hide(modal));
      }
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hide(modal);
        }
      });
    });
  }
  
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      this.showError(validation.errors.join('\n'));
      return;
    }
    
    const filmData = this.prepareFilmData(formData);
    
    try {
      this.loadingManager.show();
      
      const success = await this.saveFilmToLocalStorage(filmData);
      
      this.loadingManager.hide();
      
      if (success) {
        this.showSuccess('Фильм успешно добавлен!');
        this.form.reset();
      } else {
        this.showError('Не удалось добавить фильм');
      }
    } catch (error) {
      this.loadingManager.hide();
      this.errorManager.handleError(error, 'Ошибка при добавлении фильма');
    }
  }
  
  private prepareFilmData(formData: FormData): any {
    const releaseDate = formData.get('releaseDate') as string;
    
    const trailerUrl = prompt('Введите ссылку на трейлер (YouTube, опционально):', '');
    const imdbUrl = prompt('Введите ссылку на IMDb (опционально):', '');
    const homepage = prompt('Введите официальный сайт фильма (опционально):', '');
    
    let trailerKey = null;
    if (trailerUrl) {
      const match = trailerUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      trailerKey = match ? match[1] : null;
    }
    
    return {
      id: Date.now(),
      title: formData.get('title'),
      originalTitle: formData.get('title'),
      overview: formData.get('overview'),
      releaseDate: releaseDate,
      releaseYear: new Date(releaseDate).getFullYear(),
      runtime: parseInt(formData.get('runtime') as string),
      genres: (formData.get('genre') as string).split(',').map((g: string) => g.trim()),
      director: formData.get('director'),
      cast: (formData.get('cast') as string).split(',').map((a: string) => a.trim()),
      productionCountries: [formData.get('country')],
      language: formData.get('language'),
      posterPath: formData.get('posterUrl') || null,
      backdropPath: null,
      rating: parseFloat(formData.get('rating') as string) || 0,
      voteCount: 0,
      popularity: parseFloat(formData.get('rating') as string) * 10 || 0,
      budget: parseInt(formData.get('budget') as string) || 0,
      revenue: 0,
      homepage: homepage || null,
      imdbId: imdbUrl || null,
      status: 'Released',
      tagline: null,
      productionCompanies: [],
      trailerKey: trailerKey,
      createdAt: new Date().toISOString()
    };
  }
  
  private async saveFilmToLocalStorage(filmData: any): Promise<boolean> {
    try {
      const existingFilms = JSON.parse(localStorage.getItem('customFilms') || '[]');
      
      existingFilms.push(filmData);
      
      localStorage.setItem('customFilms', JSON.stringify(existingFilms));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to save film:', error);
      return false;
    }
  }
  
  private showSuccess(message: string): void {
    const messageElement = $('#successMessage');
    if (messageElement) {
      messageElement.textContent = message;
    }
    show(this.successModal);
  }
  
  private showError(message: string): void {
    const messageElement = $('#errorModalMessage');
    if (messageElement) {
      messageElement.textContent = message;
    }
    show(this.errorModal);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AddEntityPage();
  
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