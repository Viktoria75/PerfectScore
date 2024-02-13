document.addEventListener("DOMContentLoaded", function () {
    const productDetailsContainer = document.getElementById('product-details');

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (gameId) {
        // Fetch games from JSON file
        fetch('games.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                const jsonGames = jsonData.games;
    
                // Fetch games from localStorage
                const localGames = localStorage.getItem('games');
                const localStorageGames = localGames ? JSON.parse(localGames) : [];
    
                // Combine JSON and localStorage games
                const allGames = [...jsonGames, ...localStorageGames];
    
                // Find the game with the specified ID
                const game = allGames.find(g => g.id === gameId);
    
                if (game) {
                    displayGameDetails(game);
                } else {
                    productDetailsContainer.innerHTML = "Game not found.";
                }
            })
            .catch(error => {
                console.error('Error fetching JSON:', error);
                productDetailsContainer.innerHTML = "Error fetching game data.";
            });
    } else {
        console.log( "Invalid game ID provided.");
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
        const totalRatingNoDefault = numericRatings.length;
        let averageRating = (sumOfRatings + defaultRating) / totalRatings;
        if(defaultRating === 0){
            averageRating = (sumOfRatings) / totalRatingNoDefault;
        }
    
        console.log('Calculated averageRating:', averageRating);
    
        return averageRating;
    }
    

    function displayGameDetails(game) {

        //const averageRating = calculateAverageRating(game.id);
       
        let gameDetailsElement = document.querySelector('.game-details');
    
        // If it doesn't exist, create it
        if (!gameDetailsElement) {
            gameDetailsElement = document.createElement('div');
            gameDetailsElement.classList.add('game-details');
            document.body.appendChild(gameDetailsElement); // You might want to append it to a different parent element if needed
        }
    
        // Create the 'game-rating' element dynamically if it doesn't exist
        let ratingElement = document.querySelector('.game-rating');
        
        if (!ratingElement) {
            ratingElement = document.createElement('h4');
            ratingElement.classList.add('game-rating');
            gameDetailsElement.appendChild(ratingElement);
        }
    
        // Calculate the default rating (you can modify this based on your structure)
        let defaultRating = game['game-rating'];

    
        // Calculate the average rating
        const averageRating = calculateAverageRating(game.id, defaultRating);
             

        // Display the updated rating

        productDetailsContainer.innerHTML = `
            <div class="game-details">
                <h1 class="game-title">${game['game-title']}</h1>
                <img class="game-image"src="${game['game-image']}" alt="${game['game-title']}" width="175" height="260">
            </div>
            <div class="side-content">
            <h4 class="game-rating">Rating: &#11088;${averageRating.toFixed(1)}/10</h4>
                <p class="game-date">Release Date: ${new Date(game['game-date']).toLocaleDateString()}</p>
                <p class="game-developer">Developed By: ${game['game-developer']}</p>
                <p class="game-description"> ${game['game-description']}</p>
            </div>
        `;

        
    }



    const reviewFormPopup = document.getElementById('reviewFormPopup');
    const openFormBtn = document.getElementById('create-review');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const reviewForm = document.getElementById('reviewForm');
    const reviewText = document.getElementById('reviewText');
    const reviewTitle = document.getElementById('reviewTitle');
    const ratingInput = document.getElementById('rating');
    const overlay = document.getElementById('overlay');
    const reviewsContainer = document.getElementById('reviews');
    const warningPopup = document.getElementById('warningPopup');
    
    const loggedStatus = JSON.parse(localStorage.getItem('isLoggedIn')) || false;

    if(loggedStatus){
    openFormBtn.addEventListener('click', function () {
        reviewFormPopup.style.display = 'block';
        overlay.style.display = 'block';
    });
    
    closeFormBtn.addEventListener('click', function () {
        reviewFormPopup.style.display = 'none';
        overlay.style.display = 'none';
    });
    
    reviewForm.addEventListener('submit', function (event) {
        event.preventDefault();
    
        // Get the logged-in user
        const loggedInUser = JSON.parse(localStorage.getItem('loggedUser')) || {};
        const userEmails = Object.keys(loggedInUser);
        const userEmail = userEmails[0];
    
        // Get the user input
        const title = reviewTitle.value.trim();
        const review = reviewText.value.trim();

        function generateUniqueId() {
            // Using a combination of timestamp and random number for increased uniqueness
            const timestamp = new Date().getTime();
            const random = Math.floor(Math.random() * 1000000); // Generate a random number between 0 and 999999
            return parseInt(`${timestamp}${random}`, 10);
        }
        
        const reviewId = generateUniqueId();
        const rating = parseInt(ratingInput.value, 10);
    
        if (review !== '' && !isNaN(rating) && rating >= 1 && rating <= 10) {
            // Create a new review object
            const newReview = {
                reviewId: reviewId,
                gameId: gameId,
                user: userEmail,
                title: title,
                rating: rating,
                text: review
            };
    
            // Get existing reviews from localStorage
            const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
            // Add the new review
            storedReviews.push(newReview);
    
            // Save updated reviews to localStorage
            localStorage.setItem('reviews', JSON.stringify(storedReviews));
            
            // Close the popup form
            reviewFormPopup.style.display = 'none';
            overlay.style.display = 'none';
    
            // Clear the form fields
            reviewText.value = '';
            ratingInput.value = '';
    
            // Update the displayed reviews
            displayReviews(gameId);
        }
    });
    }
    else{
        openFormBtn.addEventListener('click', function () {
            warningPopup.style.display = 'block';
            overlay.style.display = 'block';
        });
        
        overlay.addEventListener('click', function () {
            warningPopup.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
    
    
    function displayReviews() {
        const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];

        reviewsContainer.innerHTML = '';

        // Display reviews in the reviewsContainer
        storedReviews.forEach(review => {
            if (review.gameId === gameId) {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review');
                reviewDiv.setAttribute('data-review-id', review.reviewId); 

                const titleP = document.createElement('p');
                titleP.classList.add('review-title');
                titleP.textContent = review.title;
                reviewDiv.appendChild(titleP);

                const ratingP = document.createElement('p');
                ratingP.classList.add('review-rating');
                ratingP.textContent = `Rating: ⭐ ${review.rating}`;
                reviewDiv.appendChild(ratingP);

                const textP = document.createElement('p');
                textP.classList.add('review-text');
                textP.textContent = review.text;
                reviewDiv.appendChild(textP);

                const commentCaptionsDiv = document.createElement('div');
                commentCaptionsDiv.classList.add('comment-captions');
                reviewDiv.appendChild(commentCaptionsDiv);

                const commentT = document.createElement('h4');
                commentT.classList.add('comment-section-title');
                commentT.textContent = `Comments:`;
                commentCaptionsDiv.appendChild(commentT);

                const commentP = document.createElement('button');
                commentP.classList.add('review-comment-button');
                commentP.textContent = `Comment this review`;
                commentCaptionsDiv.appendChild(commentP);

                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comments');

                reviewDiv.appendChild(commentDiv);

                reviewsContainer.appendChild(reviewDiv);
                
                displayComments(review.reviewId, commentDiv);
            }
        });

        console.log('Reviews displayed:', storedReviews);
    }

    displayReviews();


    
    // Function to display comments for a specific review
    function displayComments(reviewId, commentsContainer) {

        const storedComments = JSON.parse(localStorage.getItem('comments')) || [];

        commentsContainer.innerHTML = '';

        // Display comments in the commentsContainer
        storedComments.forEach(comment => {
            if (comment.reviewId === reviewId) {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');

                const userP = document.createElement('p');
                userP.classList.add('comment-user');
                userP.textContent = comment.user;
                commentDiv.appendChild(userP);

                const dateP = document.createElement('p');
                dateP.classList.add('comment-date');
                dateP.textContent = comment.date;
                commentDiv.appendChild(dateP);

                const textP = document.createElement('p');
                textP.classList.add('comment-text');
                textP.textContent = comment.text;
                commentDiv.appendChild(textP);

                commentsContainer.appendChild(commentDiv);
            }
        });

        console.log('Comments displayed:', storedComments);
    }



    
    function addComment(reviewId, commentText) {
        const storedComments = JSON.parse(localStorage.getItem('comments')) || [];
        const loggedInUser = JSON.parse(localStorage.getItem('loggedUser')) || {};
        const userEmails = Object.keys(loggedInUser);
        const userEmail = userEmails[0];

        const userWithEmail = loggedInUser[userEmail];
        const userUsername = userWithEmail ? userWithEmail.username : null;

        // Check if the user has a username
        if (!userUsername) {
            console.error('Username not found for the logged-in user.');
            return;
        }

        const newComment = {
            reviewId: reviewId,
            user: userUsername,
            date: new Date().toLocaleDateString(),
            text: commentText.substring(0, 200) // Limit the comment text to 200 characters
        };

        storedComments.push(newComment);

        localStorage.setItem('comments', JSON.stringify(storedComments));

    }

    // Function to display comments for a specific review
    function displayComments(reviewId) {
        const storedComments = JSON.parse(localStorage.getItem('comments')) || [];
    
        const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
    
        if (!reviewElement) {
            console.error(`Review element not found for reviewId: ${reviewId}`);
            return;
        }
    
        // Find or create the comments container inside the review element
        let commentsContainer = reviewElement.querySelector('.comments');
        if (!commentsContainer) {
            commentsContainer = document.createElement('div');
            commentsContainer.classList.add('comments');
            reviewElement.appendChild(commentsContainer);
        }
    
        commentsContainer.innerHTML = '';

        storedComments.forEach(comment => {
            if (comment.reviewId === reviewId) {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
    
                const userP = document.createElement('p');
                userP.classList.add('comment-user');
                userP.textContent = comment.user;
                commentDiv.appendChild(userP);
    
                const dateP = document.createElement('p');
                dateP.classList.add('comment-date');
                dateP.textContent = comment.date;
                commentDiv.appendChild(dateP);
    
                const textP = document.createElement('p');
                textP.classList.add('comment-text');
                textP.textContent = comment.text;
                commentDiv.appendChild(textP);
    
                commentsContainer.appendChild(commentDiv);
            }
        });
    
        console.log('Comments displayed:', storedComments);
    }
    

    

    // Event listener for adding comments
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('review-comment-button')) {
            const reviewElement = event.target.closest('.review');
            if (reviewElement) {
                const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
                console.log('Stored Reviews:', storedReviews);
                
                const reviewTitle = reviewElement.querySelector('.review-title').textContent;
                console.log('Review Title:', reviewTitle);
    
                const reviewId = storedReviews.find(review => review.title === reviewTitle)?.reviewId;
                console.log('Review ID:', reviewId);
                 if (reviewId) {
                    const commentFormPopup = document.getElementById('commentFormPopup');
                    const closeCommentFormBtn = document.getElementById('closeCommentFormBtn');
                    const commentForm = document.getElementById('commentForm');
                    const commentText = document.getElementById('commentText');

                    commentFormPopup.style.display = 'block';
                    overlay.style.display = 'block';

                    closeCommentFormBtn.addEventListener('click', function () {
                        commentFormPopup.style.display = 'none';
                        overlay.style.display = 'none';
                    });

                    commentForm.addEventListener('submit', function (event) {
                        event.preventDefault();
                        const comment = commentText.value.trim();
                        if (comment !== '') {
                            addComment(reviewId, comment);
                            commentFormPopup.style.display = 'none';
                            overlay.style.display = 'none';
                            commentText.value = '';
                            displayComments(reviewId);
                        }
                    });
                }
            }
        }
    });


    // Initial display of comments
    const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
    storedReviews.forEach(review => {
        let reviewId = review["reviewId"];
        displayComments(reviewId);
    });



    
});
