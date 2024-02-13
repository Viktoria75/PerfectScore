document.addEventListener("DOMContentLoaded", function () {
    const signInBtn = document.getElementById('signInBtn');
    const profileBtn = document.getElementById('profileBtn');
    const signOutBtn = document.getElementById('signOutBtn');

    function redirectToSignInPage() {
        window.location.href = 'signin.html';
    }

    function redirectToProfilePage() {
        window.location.href = 'profile.html';
    }

    signInBtn.addEventListener('click', redirectToSignInPage);
    profileBtn.addEventListener('click', redirectToProfilePage);
    signOutBtn.addEventListener('click', signOut);

    function signOut() {
        setLoginStatus(false);
        redirectToSignInPage();
        localStorage.removeItem("loggedUser");
    }

    //logged in state changes

    function setLoginStatus(status) {
        localStorage.setItem('isLoggedIn', status);
    }

    function checkLoginStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
    
    function updateNavigationBar() {
        if (checkLoginStatus()) {
            signInBtn.style.display = 'none';
            profileBtn.style.display = 'block';
            signOutBtn.style.display = 'block';
        } else {
            profileBtn.style.display = 'none';
            signOutBtn.style.display = 'none';
        }
    }
  
    updateNavigationBar();
});
