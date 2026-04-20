import { PaginationState } from '../types/index';
import { createElement } from '../utils/helpers';

export class Pagination {
  private state: PaginationState;
  private onPageChange: (page: number) => void;
  private container: HTMLElement;
  
  constructor(
    initialState: PaginationState,
    onPageChange: (page: number) => void
  ) {
    this.state = initialState;
    this.onPageChange = onPageChange;
    this.container = createElement('div', 'pagination');
  }
  
  updateState(newState: Partial<PaginationState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render(): HTMLElement {
    this.container.innerHTML = '';
    
    if (this.state.totalPages <= 1) {
      return this.container;
    }
    
    const paginationWrapper = createElement('div', 'pagination__wrapper');
    
    const prevButton = createElement('button', 'pagination__btn pagination__btn--prev', {
      'aria-label': 'Предыдущая страница'
    });
    prevButton.innerHTML = '← Назад';
    prevButton.disabled = this.state.currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (this.state.currentPage > 1) {
        this.onPageChange(this.state.currentPage - 1);
      }
    });
    
    const pageInfo = createElement('div', 'pagination__info');
    pageInfo.innerHTML = `
      <span class="pagination__current">${this.state.currentPage}</span>
      <span class="pagination__separator">/</span>
      <span class="pagination__total">${this.state.totalPages}</span>
    `;
    
    const nextButton = createElement('button', 'pagination__btn pagination__btn--next', {
      'aria-label': 'Следующая страница'
    });
    nextButton.innerHTML = 'Вперед →';
    nextButton.disabled = this.state.currentPage === this.state.totalPages;
    nextButton.addEventListener('click', () => {
      if (this.state.currentPage < this.state.totalPages) {
        this.onPageChange(this.state.currentPage + 1);
      }
    });
    
    const pageNumbers = this.generatePageNumbers();
    const numbersWrapper = createElement('div', 'pagination__numbers');
    
    pageNumbers.forEach(page => {
      if (page === '...') {
        const ellipsis = createElement('span', 'pagination__ellipsis');
        ellipsis.textContent = '...';
        numbersWrapper.appendChild(ellipsis);
      } else {
        const pageBtn = createElement('button', 'pagination__number', {
          'data-page': String(page)
        });
        pageBtn.textContent = String(page);
        
        if (page === this.state.currentPage) {
          pageBtn.classList.add('pagination__number--active');
        }
        
        pageBtn.addEventListener('click', () => {
          if (typeof page === 'number') {
            this.onPageChange(page);
          }
        });
        
        numbersWrapper.appendChild(pageBtn);
      }
    });
    
    paginationWrapper.appendChild(prevButton);
    paginationWrapper.appendChild(numbersWrapper);
    paginationWrapper.appendChild(pageInfo);
    paginationWrapper.appendChild(nextButton);
    
    this.container.appendChild(paginationWrapper);
    
    return this.container;
  }
  
  private generatePageNumbers(): (number | string)[] {
    const { currentPage, totalPages } = this.state;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }
  
  getContainer(): HTMLElement {
    return this.container;
  }
}