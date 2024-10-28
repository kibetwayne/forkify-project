//contain all the necessary things for rendering a nice view on the website
//it is reusable on other files that require rendering results on the page
import icons from 'url:../../img/icons.svg'; // parcel 2

//the default means we are exporting the class itself and not an instance of it
export default class View {
    _data;

    /**
     *
     * @param {*} data
     * @param {*} render
     * @returns
     */
    render(data, render = true) {
        //incase no recipe exists
        if (!data || (Array.isArray(data) && data.length === 0))
            return this.renderError();

        this._data = data;
        const markup = this._generateMarkup();

        if (!render) return markup;

        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    //updates only the needed section of the DOM
    update(data) {
        this._data = data;
        const newMarkup = this._generateMarkup();

        const newDom = document.createRange().createContextualFragment(newMarkup);
        const newElements = Array.from(newDom.querySelectorAll('*'));
        const curElements = Array.from(this._parentElement.querySelectorAll('*'));

        newElements.forEach((newEl, i) => {
            const curEl = curElements[i];

            //update changed text
            if (!newEl.isEqualNode(curEl) && newEl.firstChild) {
                if (
                    newEl.firstChild.nodeValue &&
                    newEl.firstChild.nodeValue.trim() !== ''
                ) {
                    console.log('...', newEl.firstChild.nodeValue.trim());
                    curEl.textContent = newEl.textContent;
                }
            }

            //update changed attribute
            if (!newEl.isEqualNode(curEl))
                Array.from(newEl.attributes).forEach(attr =>
                    curEl.setAttribute(attr.name, attr.value)
                );
        });
    }

    _clear() {
        this._parentElement.innerHTML = '';
    }

    //display spinner when data is being fetched
    renderSpinner() {
        const markup = `
  <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
  `;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    renderError(message = this._errorMessage) {
        const markup = `
    <div class="error">
            <div>
              <svg>
                <use href="src/img/${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;

        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    renderMessage(message = this._message) {
        const markup = `
    <div class="message">
            <div>
              <svg>
                <use href="src/img/${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;

        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }
}