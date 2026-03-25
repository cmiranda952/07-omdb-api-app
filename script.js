const OMDB_API_KEY = "dca201d7";
const WATCHLIST_STORAGE_KEY = "weekendWatchlist";

const searchForm = document.getElementById("search-form");
const movieSearchInput = document.getElementById("movie-search");
const movieResults = document.getElementById("movie-results");
const watchlistContainer = document.getElementById("watchlist");

let searchResults = [];
let watchlist = [];

// Save current watchlist to localStorage.
function saveWatchlist() {
	localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

// Load watchlist from localStorage when page starts.
function loadWatchlist() {
	const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);

	if (!savedWatchlist) {
		watchlist = [];
		return;
	}

	watchlist = JSON.parse(savedWatchlist);
}

// Build one movie card to show poster, title, and release year.
function createMovieCard(movie) {
	const posterUrl = movie.Poster !== "N/A"
		? movie.Poster
		: "https://via.placeholder.com/300x450?text=No+Poster";

	return `
		<article class="movie-card">
			<img class="movie-poster" src="${posterUrl}" alt="Poster for ${movie.Title}">
			<div class="movie-info">
				<h3 class="movie-title">${movie.Title}</h3>
				<p class="movie-year">${movie.Year}</p>
				<button class="btn btn-add" data-imdb-id="${movie.imdbID}">Add to Watchlist</button>
			</div>
		</article>
	`;
}

// Build one watchlist card.
function createWatchlistCard(movie) {
	const posterUrl = movie.Poster !== "N/A"
		? movie.Poster
		: "https://via.placeholder.com/300x450?text=No+Poster";

	return `
		<article class="movie-card">
			<img class="movie-poster" src="${posterUrl}" alt="Poster for ${movie.Title}">
			<div class="movie-info">
				<h3 class="movie-title">${movie.Title}</h3>
				<p class="movie-year">${movie.Year}</p>
				<button class="btn btn-remove" data-imdb-id="${movie.imdbID}">Remove</button>
			</div>
		</article>
	`;
}

// Show a simple message inside the results grid.
function showMessage(message) {
	movieResults.innerHTML = `<p class="no-results">${message}</p>`;
}

// Fetch movies from OMDb based on the user's search text.
async function fetchMovies(searchTerm) {
	const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchTerm)}`;
	const response = await fetch(url);
	const data = await response.json();

	return data;
}

// Turn OMDb results into movie cards in the grid.
function displayMovies(movies) {
	const movieCards = movies.map((movie) => createMovieCard(movie)).join("");
	movieResults.innerHTML = movieCards;
}

// Render the watchlist section.
function renderWatchlist() {
	if (watchlist.length === 0) {
		watchlistContainer.innerHTML = "Your watchlist is empty. Search for movies to add!";
		return;
	}

	const watchlistCards = watchlist.map((movie) => createWatchlistCard(movie)).join("");
	watchlistContainer.innerHTML = watchlistCards;
}

// Add a movie to watchlist only if it is not already there.
function addToWatchlist(imdbID) {
	const selectedMovie = searchResults.find((movie) => movie.imdbID === imdbID);
	if (!selectedMovie) {
		return;
	}

	const alreadyInWatchlist = watchlist.some((movie) => movie.imdbID === imdbID);
	if (alreadyInWatchlist) {
		return;
	}

	watchlist.push(selectedMovie);
	saveWatchlist();
	renderWatchlist();
}

// Remove a movie from watchlist.
function removeFromWatchlist(imdbID) {
	watchlist = watchlist.filter((movie) => movie.imdbID !== imdbID);
	saveWatchlist();
	renderWatchlist();
}

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const searchTerm = movieSearchInput.value.trim();

	if (searchTerm === "") {
		showMessage("Please type a movie name to search.");
		return;
	}

	showMessage("Loading movies...");

	const data = await fetchMovies(searchTerm);

	if (data.Response === "False") {
		showMessage(data.Error);
		return;
	}

	searchResults = data.Search;
	displayMovies(searchResults);
});

// Listen for Add to Watchlist button clicks inside search results.
movieResults.addEventListener("click", (event) => {
	if (!event.target.classList.contains("btn-add")) {
		return;
	}

	const imdbID = event.target.dataset.imdbId;
	addToWatchlist(imdbID);
});

// Listen for Remove button clicks inside watchlist.
watchlistContainer.addEventListener("click", (event) => {
	if (!event.target.classList.contains("btn-remove")) {
		return;
	}

	const imdbID = event.target.dataset.imdbId;
	removeFromWatchlist(imdbID);
});

// Make sure the watchlist starts with the empty message.
loadWatchlist();
renderWatchlist();
