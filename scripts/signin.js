document.addEventListener("DOMContentLoaded", function () {
    const signinButton = document.querySelector('.register');

    function redirectToSignInPage() {
        window.location.href = 'register.html';
    }

    signinButton.addEventListener('click', redirectToSignInPage);

    const loginForm = document.querySelector(".login-form");
    const loginEmail = document.querySelector(".login-email");
    const loginPassword = document.querySelector(".login-password");
    const loginError = document.querySelector(".register-error");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        loginError.textContent = '';
        loginEmail.classList.remove("invalid-field");
        loginPassword.classList.remove("invalid-field");

        if (!emailPattern.test(loginEmail.value)) {
            displayError("Invalid email format");
            loginEmail.classList.add("invalid-field");
            return;
        }

        const userData = getUserData(loginEmail.value);

        if (!userData) {
            displayError("There is no registered user with that email");
            loginEmail.classList.add("invalid-field");
            return;
        }

        if (userData.password !== loginPassword.value) {
            displayError("Wrong password");
            loginPassword.classList.add("invalid-field");
            return;
        }

        window.location.href = "index.html";
        saveLoggedPerson(loginEmail.value, loginPassword.value, userData.username);
        setLoginStatus(true);
    });

    function displayError(message) {
        loginError.textContent = message;
    }

    function saveLoggedPerson(email, password, username) {
        const loggedData = JSON.parse(localStorage.getItem('loggedUser')) || {};

        loggedData[email] = { password: password, username: username };

        localStorage.setItem('loggedUser', JSON.stringify(loggedData));
    }

    function getUserData(email) {
        const usersData = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        return usersData[email];
    }

    function setLoginStatus(status) {
        localStorage.setItem('isLoggedIn', status);
    }
});
