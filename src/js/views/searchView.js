//searing for a recipe
class SearchView {
  _parentEl = document.querySelector('.search');

  getFood() {
    const food = this._parentEl.querySelector('.search__field').value; //get what used has input in search field
    this._clearInput(); //clear searchfield after recipe is found
    return food;
  }

  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    //listen for event when form is submitted
    this._parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}
export default new SearchView(); //exporting an instance of an object created by this class insteadof the wholw class
