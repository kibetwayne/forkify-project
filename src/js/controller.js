import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//     module.hot.accept();
// }

const controlRecipe = async function() {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        //highlight the selected recipe
        resultsView.update(model.getSearchResultsPage());

        //update the bookmarks
        bookmarksView.update(model.state.bookmarks);

        //loading recipe
        await model.loadRecipe(id);

        //rendering recipe
        recipeView.render(model.state.recipe);
    } catch (error) {
        recipeView.renderError();
    }
};

//will be excecuted when searching for recipe
const controlSearchResults = async function() {
    try {
        resultsView.renderSpinner();

        //get food
        const query = searchView.getFood();
        if (!query) return;

        //load search results
        await model.loadSearResults(query);

        //render results
        //resultsView.render(model.state.search.results); =>Get all the results in one list
        resultsView.render(model.getSearchResultsPage(1)); //pagination

        //render initial pagination number
        paginationView.render(model.state.search);
    } catch (error) {
        console.log(error);
    }
};

//will be executed when the page btn is clicked
const controlPagination = function(goToPage) {
    //render new results
    resultsView.render(model.getSearchResultsPage(goToPage)); //pagination

    //render new pagination number
    paginationView.render(model.state.search);
};

//will be excecuted when changing the portion based on number of people
const controlServings = function(newServings) {
    //update the recipe servings
    model.updateServings(newServings);

    //update recipe view
    //recipeView.render(model.state.recipe); => reloads the whole DOM
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
    // add bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    //delete bookmark
    else model.deleteBookmark(model.state.recipe.id);

    //update reecipeView
    recipeView.update(model.state.recipe);

    //render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
    bookmarksView.render(model.state.bookmarks);
};

//recieve the data when uploading a new recipe
const controlAddRecipe = async function(newRecipe) {
    try {
        //show loading spinner
        addRecipeView.renderSpinner();

        //upload recipe
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        //render recipe
        recipeView.render(model.state.recipe);

        //show success message
        addRecipeView.renderMessage();

        //render bookmark view
        bookmarksView.render(model.state.bookmarks);

        //change ID in URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        //close form window inorder to see uploaded recipe
        setTimeout(function() {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('💥', err);
        addRecipeView.renderError(err.message);
    }
};

//calling the above functions
const init = function() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipe);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();