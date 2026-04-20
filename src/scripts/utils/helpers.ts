// Утилиты для работы с DOM
export function $(selector: string, parent: Document | Element = document): Element | null {
  return parent.querySelector(selector);
}

export function $$(selector: string, parent: Document | Element = document): NodeListOf<Element> {
  return parent.querySelectorAll(selector);
}

// Показать элемент
export function show(element: HTMLElement | string): void {
  const el = typeof element === 'string' ? $(element) as HTMLElement : element;
  if (el) el.style.display = '';
}

// Скрыть элемент
export function hide(element: HTMLElement | string): void {
  const el = typeof element === 'string' ? $(element) as HTMLElement : element;
  if (el) el.style.display = 'none';
}

// Переключить видимость
export function toggle(element: HTMLElement | string): void {
  const el = typeof element === 'string' ? $(element) as HTMLElement : element;
  if (el) {
    el.style.display = el.style.display === 'none' ? '' : 'none';
  }
}

// Дебаунс для оптимизации поиска
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Форматирование даты
export function formatDate(dateString: string): string {
  if (!dateString) return 'Дата не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Форматирование валюты
export function formatCurrency(amount: number): string {
  if (!amount || amount === 0) return 'Н/Д';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

// Обрезать текст
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
}

// Получить параметры из URL
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

// Получить конкретный параметр из URL
export function getUrlParam(name: string): string | null {
  return getUrlParams().get(name);
}

// Обновить URL без перезагрузки страницы
export function updateUrlParams(params: Record<string, string | number | null>): void {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  
  window.history.pushState({}, '', url.toString());
}

// Генерация звезд рейтинга
export function generateStarRating(rating: number, maxStars: number = 10): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += '<span class="star star--full">★</span>';
  }
  
  if (hasHalfStar) {
    html += '<span class="star star--half">½</span>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += '<span class="star star--empty">☆</span>';
  }
  
  return html;
}

// Валидация формы
export function validateForm(formData: FormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const title = formData.get('title') as string;
  const overview = formData.get('overview') as string;
  const releaseDate = formData.get('releaseDate') as string;
  const runtime = formData.get('runtime') as string;
  const genre = formData.get('genre') as string;
  const director = formData.get('director') as string;
  const cast = formData.get('cast') as string;
  const country = formData.get('country') as string;
  const language = formData.get('language') as string;
  
  if (!title || title.length < 2) {
    errors.push('Название фильма должно содержать минимум 2 символа');
  }
  
  if (!overview || overview.length < 10) {
    errors.push('Описание фильма должно содержать минимум 10 символов');
  }
  
  if (!releaseDate) {
    errors.push('Укажите дату выхода фильма');
  }
  
  if (!runtime || parseInt(runtime) < 1) {
    errors.push('Продолжительность фильма должна быть больше 0');
  }
  
  if (!genre || genre.length < 2) {
    errors.push('Укажите хотя бы один жанр');
  }
  
  if (!director || director.length < 2) {
    errors.push('Укажите режиссера фильма');
  }
  
  if (!cast || cast.length < 2) {
    errors.push('Укажите хотя бы одного актера');
  }
  
  if (!country || country.length < 2) {
    errors.push('Укажите страну производства');
  }
  
  if (!language || language.length < 2) {
    errors.push('Укажите язык фильма');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Создание элемента с классами
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  if (className) {
    element.className = className;
  }
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  return element;
}

// Анимация загрузки
export class LoadingManager {
  private static instance: LoadingManager;
  private loadingElement: HTMLElement | null = null;
  
  private constructor() {
    this.loadingElement = $('#loadingIndicator') as HTMLElement;
  }
  
  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }
  
  show(): void {
    if (this.loadingElement) {
      show(this.loadingElement);
    }
  }
  
  hide(): void {
    if (this.loadingElement) {
      hide(this.loadingElement);
    }
  }
  
  setLoading(isLoading: boolean): void {
    if (isLoading) {
      this.show();
    } else {
      this.hide();
    }
  }
}

// Управление ошибками
export class ErrorManager {
  private static instance: ErrorManager;
  private errorElement: HTMLElement | null = null;
  
  private constructor() {
    this.errorElement = $('#errorMessage') as HTMLElement;
  }
  
  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }
  
  show(message: string): void {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      show(this.errorElement);
      
      setTimeout(() => this.hide(), 5000);
    }
  }
  
  hide(): void {
    if (this.errorElement) {
      hide(this.errorElement);
    }
  }
  
  handleError(error: unknown, defaultMessage: string = 'Произошла ошибка'): void {
    const message = error instanceof Error ? error.message : defaultMessage;
    this.show(message);
    console.error('Error:', error);
  }
}