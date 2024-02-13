//import { calculateAverageRating } from '/scripts/product.js';

document.addEventListener("DOMContentLoaded", function () {
    const gamesContainer = document.querySelector('.games');
    const sortReviewsButton = document.getElementById('sortReviewsButton');

    function createGameCard(game) {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game');

        gameCard.innerHTML = `
            <img class="game-image" src="${game['game-image']}" alt="${game['game-title']}" width="175" height="260">
            <span class="game-title">${game['game-title']}</span>
            <span class="game-rating">&#11088;${game['game-rating']}</span>
            <span class="game-date">${new Date(game['game-date']).toLocaleDateString()}</span>
        `;

        const gameImage = gameCard.querySelector('.game-image');
        if (gameImage) {
            gameImage.addEventListener("click", function () {
                window.location.href = `product.html?id=${game.id}`;
            });
        }

        return gameCard;
    }

    function calculateAverageRating(gameId, defaultRating) {
        const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const gameReviews = storedReviews.filter(review => review.gameId === gameId);
    
        console.log('gameReviews:', gameReviews);
    
        if (gameReviews.length === 0) {
            console.log('No reviews found. Returning defaultRating:', defaultRating);
            return defaultRating;
        }
    
        const numericRatings = gameReviews.map(review => {
            const rating = parseFloat(review.rating);
            console.log(`Review rating for gameId ${gameId}:`, rating);
            return rating;
        });
    
        console.log('Numeric ratings:', numericRatings);
    
        if (numericRatings.some(isNaN)) {
            console.warn(`Non-numeric rating found for gameId ${gameId}. Ratings:`, numericRatings);
            return defaultRating;
        }
    
        const sumOfRatings = numericRatings.reduce((sum, rating) => sum + rating, 0);
        const totalRatings = numericRatings.length + 1; // Add 1 to include the default rating
        const averageRating = (sumOfRatings + defaultRating) / totalRatings;
    
        console.log('Calculated averageRating:', averageRating);
    
        return averageRating;
    }

    function renderGameCards(games, sortCriteria = 'game-rating') {
        const sortedGames = games.slice().sort((a, b) => {
            if (sortCriteria === 'game-rating') {
                const ratingA = calculateAverageRating(a.id, a['game-rating']);
                        const ratingB = calculateAverageRating(b.id, b['game-rating']);
                        return ratingB - ratingA;
            } else if (sortCriteria === 'reviews') {

                const reviewsCountMap = getReviewsCountMap();
                const reviewsCountA = reviewsCountMap[a.id] || 0;
                const reviewsCountB = reviewsCountMap[b.id] || 0;
                return reviewsCountB - reviewsCountA;
            } else {
                // Default sorting by rating
                return b['game-rating'] - a['game-rating'];
            }
        });

        gamesContainer.innerHTML = '';

        sortedGames.forEach(gameData => {
            const gameCard = createGameCard(gameData);
            gamesContainer.appendChild(gameCard);
        });
    }

    function getLocalGames() {
        const localGames = localStorage.getItem('games');
        return localGames ? JSON.parse(localGames) : [];
    }

    function sortGamesByReviews(games) {
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

        // Create a map to store the number of reviews for each game ID
        const reviewsCountMap = {};
        for (const review of reviews) {
            if (review.gameId in reviewsCountMap) {
                reviewsCountMap[review.gameId]++;
            } else {
                reviewsCountMap[review.gameId] = 1;
            }
        }

        // Sort games by the number of reviews they have
        return games.sort((a, b) => {
            const reviewsCountA = reviewsCountMap[a.id] || 0;
            const reviewsCountB = reviewsCountMap[b.id] || 0;
            return reviewsCountB - reviewsCountA;
        });
    }

    let currentSortCriteria = 'game-rating';

    function handleSortByReviews() {
        // Fetch games from JSON file
        fetch('games.json')
            .then(response => response.json())
            .then(data => {
                const jsonGames = data.games;
                const localGames = getLocalGames();
                const allGames = [...jsonGames, ...localGames];

                // Update the current sort criteria only when the button is clicked
                currentSortCriteria = (currentSortCriteria === 'reviews') ? 'game-rating' : 'reviews';

                // Sort games based on the current criteria
                const sortedGames = (currentSortCriteria === 'reviews') ?
                    sortGamesByReviews(allGames) :
                    allGames.slice().sort((a, b) => {
                        // Use calculateAverageRating for sorting instead of 'game-rating'
                        const ratingA = calculateAverageRating(a.id, a['game-rating']);
                        const ratingB = calculateAverageRating(b.id, b['game-rating']);
                        return ratingB - ratingA;
                    });

                console.log(`Sorted Games by ${currentSortCriteria}:`, sortedGames);

                // Render the sorted games
                renderGameCards(sortedGames, currentSortCriteria);
            })
            .catch(error => console.error('Error fetching JSON:', error));
    }

    // Initial rendering with default sorting 
    handleSortByReviews();

    sortReviewsButton.addEventListener('click', handleSortByReviews);


    sortReviewsButton.addEventListener('click', handleSortByReviews);

    function getReviewsCountMap() {
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const reviewsCountMap = {};

        for (const review of reviews) {
            if (review.gameId in reviewsCountMap) {
                reviewsCountMap[review.gameId]++;
            } else {
                reviewsCountMap[review.gameId] = 1;
            }
        }

        return reviewsCountMap;
    }

});
