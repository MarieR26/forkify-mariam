import "core-js/stable"; /* polyfilling everything else */
import "regenerator-runtime/runtime"; /* polyfilling async await */
import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";
// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // we take id from url bar:
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // 0 .update results view to mark selected search result:
    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    // 1.load recipe:
    await model.loadRecipe(id);

    // 2. render recipe:
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // 1.get search query:
    const query = searchView.getQuery();
    if (!query) return;

    // render spinner:
    resultsView.renderSpinner();

    // 2. load search results
    await model.loadSearchResults(query);
    // 3.render results:
    resultsView.render(model.getSearchResultsPage());

    //4.render pagination buttons:
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3.render new results:
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4.render new pagination buttons:
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //  update the recipe servings(in state):
  model.updateServings(newServings);
  // update the recipe view:
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add/remove bookmark:
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update recipe view:
  recipeView.update(model.state.recipe);

  // render bookmarks:
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // upload new recipe data:
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe in the recipe view:
    recipeView.render(model.state.recipe);

    // close form window:
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    // success message:
    addRecipeView.renderMessage();

    // render bookmark view:
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL:
    window.history.pushState(null, "", `#${model.state.recipe.id}`);
  } catch (err) {
    console.error("💥", err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
