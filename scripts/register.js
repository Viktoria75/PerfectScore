document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        resetErrors();

        const registerUsername = document.getElementById('registerUsername').value;
        const registerEmail = document.getElementById('registerEmail').value;
        const registerPassword = document.getElementById('registerPassword').value;
        const repeatPassword = document.getElementById('repeatPassword').value;

        if (!isValidEmail(registerEmail)) {
            displayError("Invalid email format", 'register-email');
            return;
        }

        if (isEmailRegistered(registerEmail)) {
            displayError("Already registered email", 'register-email');
            return;
        }

        if (isUsernameRegistered(registerUsername)) {
            displayError("Username taken", 'register-username');
            return;
        }

        if (!isValidPassword(registerPassword)) {
            displayError("Password must contain both lowercase and uppercase letters, a symbol, a number and be at least 8 characters long.", 'register-password');
            return;
        }

        if (repeatPassword !== registerPassword) {
            displayError("Passwords do not match", 'repeat-password');
            return;
        }

        saveUserData(registerEmail, registerPassword, registerUsername);
        saveLoggedPerson(registerEmail, registerPassword, registerUsername);
        setLoginStatus(true);
        window.location.href = 'index.html';
    });

    let repeatPasswordInput = document.getElementById('repeatPassword');

    repeatPasswordInput.addEventListener('input', function () {
        const passwordInput = document.getElementById('registerPassword');
        const repeatPasswordValue = this.value;
        const passwordValue = passwordInput.value;

        if (repeatPasswordValue !== passwordValue) {
            this.classList.add('invalid-field');
        } else {
            this.classList.remove('invalid-field');
        }
    });

    function isValidEmail(registerEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(registerEmail);
    }

    function isValidPassword(registerPassword) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        return passwordRegex.test(registerPassword);
    }

    function isEmailRegistered(registerEmail) {
        return !!getUserData(registerEmail);
    }

    function isUsernameRegistered(registerUsername) {
        return !!getUserUsername(registerUsername);
    }

    function resetErrors() {
        const errorSpan = document.querySelector('.register-error');
        errorSpan.textContent = '';

        document.getElementById('registerEmail').classList.remove('invalid-field');
        document.getElementById('registerPassword').classList.remove('invalid-field');
        document.getElementById('repeatPassword').classList.remove('invalid-field');
    }

    function displayError(message, field) {
        const errorSpan = document.querySelector('.register-error');
        errorSpan.textContent = message;
        registerForm.querySelector('.' + field).classList.add('invalid-field');
    }

    function getUserData(email) {
        const usersData = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        return usersData[email];
    }

    function getUserUsername(username) {
        const usersData = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        const userWithEmail = Object.values(usersData).find(user => user.username === username);
        return userWithEmail ? userWithEmail : null;
    }
    
    function saveUserData(email, password, username) {
        const usersData = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    
        usersData[email] = { password: password, username: username };

        localStorage.setItem('registeredUsers', JSON.stringify(usersData));
    } 
    
    function saveLoggedPerson(email, password, username) {
        const loggedData = JSON.parse(localStorage.getItem('loggedUser')) || {};
    
        loggedData[email] = { password: password, username: username };
    
        localStorage.setItem('loggedUser', JSON.stringify(loggedData));
    } 

    function setLoginStatus(status) {
        localStorage.setItem('isLoggedIn', status);
    }

});
