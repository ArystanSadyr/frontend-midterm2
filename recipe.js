const apiKey = '6677bc5be16a46dc9ecd3ce0cc98bf9e';
let savedFavorites = JSON.parse(localStorage.getItem("recipeFavorites")) || [];
let debounceTimer;

displayFavoriteRecipes();

document.getElementById("search-bar").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchRecipes, 500);
});

async function fetchRecipes() {
    const query = document.getElementById("search-bar").value.trim();
    if (!query) return;

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&apiKey=${apiKey}`);
        if (!response.ok) throw new Error("Unable to fetch recipes");

        const data = await response.json();
        renderRecipeList(data.results);
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

function renderRecipeList(recipes) {
    const recipeListEl = document.getElementById("recipe-list");
    recipeListEl.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetails(${recipe.id})">
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
        </div>
    `).join('');
}

async function showRecipeDetails(id) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
        if (!response.ok) throw new Error("Recipe details not found");

        const recipe = await response.json();
        populateRecipeModal(recipe);
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
}

function populateRecipeModal(recipe) {
    document.getElementById("recipe-name").innerText = recipe.title;
    document.getElementById("ingredients-list").innerText = `Ingredients: ${recipe.extendedIngredients.map(i => i.original).join(', ')}`;
    document.getElementById("instructions").innerText = `Instructions: ${recipe.instructions || "Not available"}`;

    const saveFavoriteBtn = document.getElementById("save-favorite-btn");
    if (saveFavoriteBtn) {
        saveFavoriteBtn.onclick = () => addRecipeToFavorites(recipe);
    }

    document.getElementById("recipe-modal").style.display = "flex";
}

function addRecipeToFavorites(recipe) {
    if (!savedFavorites.some(fav => fav.id === recipe.id)) {
        savedFavorites.push({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image
        });
        localStorage.setItem("recipeFavorites", JSON.stringify(savedFavorites));
        displayFavoriteRecipes();
    }
}

function displayFavoriteRecipes() {
    const favoritesEl = document.getElementById("favorite-recipes");
    favoritesEl.innerHTML = savedFavorites.map(fav => `
        <div class="favorite-recipe-card">
            <span class="remove-fav-btn" onclick="removeRecipeFromFavorites(${fav.id})">&times;</span>
            <img src="${fav.image}" alt="${fav.title}">
            <h3>${fav.title}</h3>
        </div>
    `).join('');
}

function removeRecipeFromFavorites(id) {
    savedFavorites = savedFavorites.filter(recipe => recipe.id !== id);
    localStorage.setItem("recipeFavorites", JSON.stringify(savedFavorites));
    displayFavoriteRecipes();
}

function closeModal() {
    document.getElementById("recipe-modal").style.display = "none";
}
