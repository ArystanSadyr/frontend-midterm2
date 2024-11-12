const apiKey = 'c0e154d3cb4d56710255e0283f4a3745'; 
let watchlistData = JSON.parse(localStorage.getItem("savedWatchlist")) || [];
let movieDataStore = [];
let currentSearchQuery = '';

displayWatchlistItems();

async function initiateMovieSearch() {
    const searchQuery = document.getElementById("movie-search").value;
    currentSearchQuery = searchQuery;

    if (!searchQuery) return;

    try {
        const response = await fetchMovieData(searchQuery, document.getElementById("sort-select").value);
        movieDataStore = response.results;
        applySortOrder();
    } catch (error) {
        console.error("Error while searching movies:", error);
    }
}

async function fetchMovieData(query, sortBy) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&sort_by=${sortBy}&api_key=${apiKey}`);
    if (!response.ok) throw new Error("Failed to retrieve movie data");
    return response.json();
}

function applySortOrder() {
    const sortOption = document.getElementById("sort-select").value;

    movieDataStore.sort((a, b) => {
        if (sortOption === 'popularity.desc') return b.popularity - a.popularity;
        if (sortOption === 'release_date.desc') return new Date(b.release_date) - new Date(a.release_date);
        if (sortOption === 'vote_average.desc') return b.vote_average - a.vote_average;
        return 0;
    });

    renderMovies(movieDataStore);
}

function renderMovies(movies) {
    const movieGrid = document.getElementById("movie-display-grid");
    movieGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="showMovieInfo(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release: ${movie.release_date}</p>
        </div>
    `).join('');
}

async function showMovieInfo(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        if (!response.ok) throw new Error("Failed to retrieve movie details");

        const movie = await response.json();
        populateMovieModal(movie);
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

function populateMovieModal(movie) {
    document.getElementById("movie-name").innerText = movie.title;
    document.getElementById("movie-details").innerText = movie.overview || "No synopsis available.";
    document.getElementById("movie-metrics").innerText = `Rating: ${movie.vote_average} | Runtime: ${movie.runtime} mins`;
    document.getElementById("add-watchlist-btn").onclick = () => addToWatchlist(movie);

    document.getElementById("movie-info-modal").style.display = "flex";
}

function addToWatchlist(movie) {
    if (!watchlistData.some(item => item.id === movie.id)) {
        watchlistData.push(movie);
        localStorage.setItem("savedWatchlist", JSON.stringify(watchlistData));
        displayWatchlistItems();
    }
}

function removeFromWatchlist(movieId) {
    watchlistData = watchlistData.filter(movie => movie.id !== movieId);
    localStorage.setItem("savedWatchlist", JSON.stringify(watchlistData));
    displayWatchlistItems();
}

function displayWatchlistItems() {
    const watchlistContainer = document.getElementById("watchlist-container");
    watchlistContainer.innerHTML = watchlistData.map(movie => `
        <div class="watchlist-item">
            <span class="remove-item" onclick="removeFromWatchlist(${movie.id})">&times;</span>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Released: ${movie.release_date}</p>
        </div>
    `).join('');
}

function hideModal() {
    document.getElementById("movie-info-modal").style.display = "none";
}
