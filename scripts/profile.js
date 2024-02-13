document.addEventListener("DOMContentLoaded", function () {

    //displaying the user stats

    var passwordButton = document.getElementById('show-password');
    var passwordText = document.getElementById('user-password');

    var isShown = false;

    function togglePasswordVisibility() {
        if (isShown) {
            passwordButton.textContent = 'Show';
            passwordText.style.display = 'none';
        } else {
            passwordButton.textContent = 'Hide';
            passwordText.style.display = 'block';
        }

        isShown = !isShown; // toggle the state
    }

    passwordButton.addEventListener('click', togglePasswordVisibility);
    const usersData = JSON.parse(localStorage.getItem('loggedUser')) || {};
    
    const userUsername = document.getElementById('user-username');
    const userEmailSpan = document.getElementById('user-email');
    const userPasswordSpan = document.getElementById('user-password');
    
    const userEmails = Object.keys(usersData);
    const userEmail = userEmails[0];

    const userData = usersData[userEmail];


    function displayUserData() {   
        if (userEmails.length > 0) {
            
            userUsername.textContent = userData.username;
            userEmailSpan.textContent = userEmail;
            userPasswordSpan.textContent = userData.password;
        } else {
            userEmailSpan.textContent = "User data not found";
            userPasswordSpan.textContent = "";
        }
    }

    displayUserData();
    



    //displaying the reviews

    async function fetchGamesData() {
        try {
            // Fetch games from JSON file
            const response = await fetch('games.json');
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
    
            const jsonData = await response.json();
            const jsonGames = jsonData.games;
    
            // Fetch games from localStorage
            const localGames = localStorage.getItem('games');
            const localStorageGames = localGames ? JSON.parse(localGames) : [];
    
            // Combine JSON and localStorage games
            const allGames = [...jsonGames, ...localStorageGames];
    
            return allGames;
        } catch (error) {
            console.error('Error fetching games data:', error);
            throw error;
        }
    }
    
    async function getGameTitleById(gameId) {
        try {
            const gamesData = await fetchGamesData();
    
            const game = gamesData.find(game => game.id === gameId);
    
            return game ? game['game-title'] : 'Unknown Game';
        } catch (error) {
            console.error('Error getting game title by ID:', error);
            return 'Unknown Game';
        }
    }
    

    async function displayUserReviews() {
        try {
            const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
            // Clear existing reviews on the profile page
            const userProfileReviewsContainer = document.getElementById('user-profile-reviews');
            userProfileReviewsContainer.innerHTML = '';
    
            // Display user reviews on the profile page
            for (const review of storedReviews) {
                if (review.user === userEmail) {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.classList.add('review');
    
                    const gameId = review.gameId;
    
                    // Get the game title based on the gameId
                    const gameTitle = await getGameTitleById(gameId);
    
                    const titleAndRemoveDiv = document.createElement('div');
                    titleAndRemoveDiv.classList.add('review-captions');
    
                    const gameTitleP = document.createElement('p');
                    gameTitleP.classList.add('review-title');
                    gameTitleP.textContent = `Review for ${gameTitle}`;
                    titleAndRemoveDiv.appendChild(gameTitleP);
    
                    const removeButton = document.createElement('button');
                    removeButton.classList.add('remove-review-button');
                    removeButton.textContent = 'Delete review';
                    removeButton.addEventListener('click', () => removeReview(review)); 
                    titleAndRemoveDiv.appendChild(removeButton);
    
                    reviewDiv.appendChild(titleAndRemoveDiv);
    
                    const ratingP = document.createElement('p');
                    ratingP.classList.add('review-rating');
                    ratingP.textContent = `Rating:⭐${review.rating}`;
                    reviewDiv.appendChild(ratingP);
    
                    const textP = document.createElement('p');
                    textP.classList.add('review-text');
                    textP.textContent = review.text;
                    reviewDiv.appendChild(textP);
    
                    userProfileReviewsContainer.appendChild(reviewDiv);
                }
            }
        } catch (error) {
            console.error('Error displaying user reviews:', error);
        }
    }
    
    function removeReview(review) {
        try {
            const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
            const indexToRemove = storedReviews.findIndex(r => r.id === review.id);
    
            if (indexToRemove !== -1) {
                storedReviews.splice(indexToRemove, 1);
    
                localStorage.setItem('reviews', JSON.stringify(storedReviews));
    
                displayUserReviews();
            } else {
                console.error('Review not found for removal');
            }
        } catch (error) {
            console.error('Error removing review:', error);
        }
    }

    displayUserReviews();




    //getting the game data

    const gameFormPopup = document.getElementById('gameFormPopup');
    const gameAddBtn = document.getElementById('gameAddBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const gameForm = document.getElementById('gameForm');
    const gameNameInput = document.getElementById('gameName');
    const gameImageInput = document.getElementById('gameImage');
    const gameDescriptionInput = document.getElementById('gameDesc');
    const overlay = document.getElementById('overlay');

    gameAddBtn.addEventListener('click', function () {
        gameFormPopup.style.display = 'block';
        overlay.style.display = 'block';
    });

    closeFormBtn.addEventListener('click', function () {
        gameFormPopup.style.display = 'none';
        overlay.style.display = 'none';
    });

    function isGameNameUnique(gameName, storedGames) {
        return storedGames.every(game => game["game-title"].toLowerCase() !== gameName.toLowerCase());
    } //validator function for existing game

    gameForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the form input values
        const gameName = gameNameInput.value.trim();
        let gameImage = gameImageInput.value.trim();
        const gameDeveloper = userData.username;
        const gameReleaseDate = new Date().toISOString();
        const gameRating = 0;
        const gameDescription = gameDescriptionInput.value.trim();

        if (!gameImage) {
            gameImage = "./images/noimage.jpg";
        }

        const gameId = generateUniqueId();

        const newGame = {
            "game-image": gameImage,
            "game-title": gameName,
            "game-rating": gameRating,
            "game-date": gameReleaseDate,
            "game-description": gameDescription,
            "game-developer": gameDeveloper,
            "id":gameId
        };

        const storedGames = JSON.parse(localStorage.getItem('games')) || [];

        if (!isGameNameUnique(gameName, storedGames)) {
            alert('A game with the same name already exists.');
            return;
        }


        storedGames.push(newGame);

        localStorage.setItem('games', JSON.stringify(storedGames));

        gameFormPopup.style.display = 'none';
        overlay.style.display = 'none';


        gameNameInput.value = '';
        gameImageInput.value = '';


        displayUserGames(userEmail);
    });
    
    function generateUniqueId() {
        const timestamp = new Date().getTime().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return timestamp + random;
    }
    
    
    





    //displaying the game data

    function displayUserGames() {
        const storedGames = JSON.parse(localStorage.getItem('games')) || [];
    
        // Filter games by the logged-in user's username
        const userGames = storedGames.filter(game => game["game-developer"] === userData.username);
    
        // Display user games in the HTML
        const userProfileGames = document.getElementById('user-profile-games');
        userProfileGames.innerHTML = '';
    
        userGames.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game');
            gameDiv.innerHTML = `
                <img class="game-image" src="${game["game-image"]}" alt="game image">
                <span class="game-title">${game["game-title"]}</span>
                <span class="edit-game-button" id="gameEditBtn" data-gameid="${game.id}">Edit</span>
            `;
            userProfileGames.appendChild(gameDiv);
        });
    }
    
    

    // async function transferDataToLocalStorage() {
    //     try {
    //         // Check if data transfer has already occurred
    //         if (localStorage.getItem('dataTransferred') === 'true') {
    //             console.log('Data already transferred. Skipping...');
    //             return;
    //         }

    //         const gamesData = await fetchGamesData();

    //         // Store the games data in localStorage
    //         localStorage.setItem('games', JSON.stringify(gamesData));
    //         localStorage.setItem('dataTransferred', 'true');

    //         console.log('Data transferred successfully');

    //     } catch (error) {
    //         console.error('Error transferring data to localStorage:', error);
    //     }
    // }

    // if (localStorage.getItem('dataTransferred') === null) {
    //     localStorage.setItem('dataTransferred', 'false');
    // }


    //transferDataToLocalStorage();


    displayUserGames(userEmail);





    //editing the game data

    const editFormPopup = document.getElementById('editFormPopup');
    const closeEditBtn = document.getElementById('closeEditBtn');
    const editForm = document.getElementById('editForm');
    const editGameNameInput = document.getElementById('editgameName');
    const editGameImageInput = document.getElementById('editgameImage');
    const editGameDescriptionInput = document.getElementById('editgameDesc');

    closeEditBtn.addEventListener('click', function () {
        closeGameForm();
    });
    
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('edit-game-button')) {
            const selectedGameId = event.target.getAttribute('data-gameid');
            editGame(selectedGameId);
        }
    });//so we don't need to refresh the page
    
    function editGame(gameId) {
        openGameForm(gameId);
    }
    
    editForm.addEventListener('submit', function (event) {
        event.preventDefault();
    
        const gameId = editForm.getAttribute('gameId');
        const gameName = editGameNameInput.value.trim();
        let gameImage = editGameImageInput.value.trim();
        const gameDeveloper = userData.username;
        const gameReleaseDate = new Date().toISOString();
        const gameRating = 0;
        const gameDescription = editGameDescriptionInput.value.trim();
    
        if (!gameImage) {
            gameImage = "./images/noimage.jpeg";
        }
    
        const updatedGame = {
            "game-image": gameImage,
            "game-title": gameName,
            "game-rating": gameRating,
            "game-date": gameReleaseDate,
            "game-description": gameDescription,
            "game-developer": gameDeveloper,
            "id": gameId
        };
    
        // Get existing games from localStorage
        let storedGames = JSON.parse(localStorage.getItem('games')) || [];
    
        if (gameId) {
            // Find the index of the game to be updated
            const gameIndex = storedGames.findIndex(game => game.id === gameId);
    
            // Update the game in the array
            storedGames[gameIndex] = updatedGame;
        } else {
            // If there is no gameId, it means it's a new game, so add it to the array
            storedGames.push(updatedGame);
        }
    
        // Save the updated games to localStorage
        localStorage.setItem('games', JSON.stringify(storedGames));
    
        // Close the popup form
        closeGameForm();
    
        // Clear the form fields
        clearFormFields();
    
        // Update the displayed user games
        displayUserGames(userEmail);
    });
    
    

    function openGameForm(gameId) {
        editFormPopup.style.display = 'block';
        overlay.style.display = 'block';

        if (gameId) {
            // Populate the form fields with the existing game data for editing
            const storedGames = JSON.parse(localStorage.getItem('games')) || [];
            const selectedGame = storedGames.find(game => game.id === gameId);

            if (selectedGame) {
                editForm.setAttribute('gameId', selectedGame.id);
                editGameNameInput.value = selectedGame["game-title"];
                editGameImageInput.value = selectedGame["game-image"];
                editGameDescriptionInput.value = selectedGame["game-description"];
            }
        }
    }

    function closeGameForm() {
        editFormPopup.style.display = 'none';
        overlay.style.display = 'none';

        // Clear the form fields
        clearFormFields();
    }

    function clearFormFields() {
        //editForm.removeAttribute('data-game-id');
        editGameNameInput.value = '';
        editGameImageInput.value = '';
        editGameDescriptionInput.value = '';
    }



    //removing a game 

    const removeGameBtn = document.getElementById('removeGameBtn');

    removeGameBtn.addEventListener('click', function () {
        const gameId = editForm.getAttribute('gameId');

        if (gameId) {
            let storedGames = JSON.parse(localStorage.getItem('games')) || [];

            // Find the index of the game to be removed
            const gameIndex = storedGames.findIndex(game => game.id === gameId);

            if (gameIndex !== -1) {
                // Remove the game from the array
                storedGames.splice(gameIndex, 1);

                // Save the updated games to localStorage
                localStorage.setItem('games', JSON.stringify(storedGames));

                closeGameForm();

                clearFormFields();

                // Update the displayed user games
                displayUserGames(userEmail);
            }
        }
    });
    

    
});
