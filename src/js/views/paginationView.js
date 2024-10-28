//rendering the results of available recipes on the webpage
import View from './view.js';
import icons from 'url:../../img/icons.svg'; // parcel 2

const createButton = function(page, direction, icons) {
    return `
        <button class="btn--inline pagination__btn--${direction}" data-goto="${page}">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-${
    direction === 'prev' ? 'left' : 'right'
  }"></use>
            </svg>
            <span>Page ${page}</span>
        </button>
    `;
};

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn--inline');

            //get number you want to go to when button is clicked
            if (!btn) return;
            const goToPage = +btn.dataset.goto;
            handler(goToPage);
        });
    }

    _generateMarkup() {
        const currentPage = this._data.page;
        //find out the number of pages needed
        const numPages = Math.ceil(
            this._data.results.length / this._data.resultsPerPage
        );

        // If there's only one page, don't display pagination
        if (numPages <= 1) return '';

        // First page and more pages available
        if (currentPage === 1) {
            return createButton(currentPage + 1, 'next', icons);
        }

        // Last page
        if (currentPage === numPages) {
            return createButton(currentPage - 1, 'prev', icons);
        }

        // Any other page (not first or last)
        return `
            ${createButton(currentPage - 1, 'prev', icons)}
            ${createButton(currentPage + 1, 'next', icons)}
        `;
    }
}
export default new PaginationView();