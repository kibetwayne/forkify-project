import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helper';

//state contsines the all hte data we need
export const state = {
    recipe: {},
    search: {
        food: '', //can be used to find out which food is popular
        results: [],
        page: 1, //always start on pg1
        resultsPerPage: RESULTS_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function(data) {
    const { recipe } = data.data;
    return {
        //renaming the data from API
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    };
};

export const loadRecipe = async function(id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

        console.log(state.recipe);
    } catch (error) {
        console.error(`${error}`);
        throw error;
    }
};

//searching for recipes
export const loadSearResults = async function name(food) {
    try {
        state.search.food = food;
        const data = await AJAX(`${API_URL}?search=${food}&key=${KEY}`);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            };
        });
        state.search.page = 1;
    } catch (error) {
        console.error(`${error}`);
        throw error;
    }
};
loadSearResults('pizza');

//getting the paage number
export const getSearchResultsPage = function(page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage; //lets say page 1= (1-1) * 10 = 0
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

//updating the servings
export const updateServings = function(newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    });

    state.recipe.servings = newServings;
};

//update local storage when adding or deleting a bookmark
const saveBookmarks = function() {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function(recipe) {
    //add bookmark
    state.bookmarks.push(recipe);

    //mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    //update local storage
    saveBookmarks();
};

export const deleteBookmark = function(id) {
    //delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    //mark current recipe as not bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    //update local storage
    saveBookmarks();
};

//exporting the data stored in the local storage to the web
const init = function() {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
};
init();

//receive data from the form and turn it into same api format
export const uploadRecipe = async function(newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                if (ingArr.length !== 3)
                    throw new Error(
                        'wrong ingredient format! Please use the correct format'
                    );

                const [quantity, unit, description] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, description };
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
};