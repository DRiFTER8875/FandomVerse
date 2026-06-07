document.addEventListener("DOMContentLoaded", () => {

    /* --- VIEW TOGGLE LOGIC --- */
    const loginContainer = document.getElementById('loginContainer');
    const signupContainer = document.getElementById('signupContainer');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');

    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    /* --- LOGIN LOGIC --- */
    const loginBtn = document.getElementById('loginBtn');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');

    loginBtn.addEventListener('click', () => {
        const userIn = loginUsernameInput.value.trim();
        const passIn = loginPasswordInput.value.trim();

        if (userIn === "" || passIn === "") {
            alert("Please fill in both Username and Password fields.");
            return;
        }

        // Check Admin
        if (userIn === "admin") {
            if (passIn === "admin123") {
                localStorage.setItem("currentUser", JSON.stringify({ name: "Drifter", role: "admin" }));
                alert("Welcome, Admin Drifter.");
                window.location.href = "admin_dashboard.html";
                return;
            } else if (passIn === "admin456") {
                localStorage.setItem("currentUser", JSON.stringify({ name: "Ryzlo", role: "admin" }));
                alert("Welcome, Admin Ryzlo.");
                window.location.href = "admin_dashboard.html";
                return;
            }
            alert("Invalid Admin Credentials.");
            return; 
        }

        // Check Customer
        const users = JSON.parse(localStorage.getItem('fandomUsers')) || [];
        const foundUser = users.find(u => u.username === userIn && u.password === passIn);

        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify({
                name: foundUser.firstName,
                username: foundUser.username,
                role: "customer"
            }));
            window.location.href = "index.html"; // Redirect to home
        } else {
            alert("Invalid Username or Password.");
        }
    });

    /* --- SIGNUP LOGIC --- */
    const signupBtn = document.getElementById('signupBtn');
    
    signupBtn.addEventListener('click', () => {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
        let isValid = true;

        if (username.length < 5 || username.length > 15) {
            showError('usernameError', 'Username must be 5-15 characters');
            isValid = false;
        }

        const existingUsers = JSON.parse(localStorage.getItem('fandomUsers')) || [];
        if (existingUsers.some(user => user.username === username)) {
            showError('usernameError', 'Username already taken!');
            isValid = false;
        }

        const emailRules = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRules.test(email)) {
            showError('emailError', 'Enter a valid email');
            isValid = false;
        }

        const passwordRules = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
        if (!passwordRules.test(password)) {
            showError('passwordError', '8+ chars, 1 number & 1 uppercase');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', "Passwords don't match.");
            isValid = false;
        }

        if (isValid) {
            const newUser = {
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                password: password,
                role: "customer"
            };

            existingUsers.push(newUser);
            localStorage.setItem('fandomUsers', JSON.stringify(existingUsers));

            alert("Account created successfully! Please Log In.");
            // Switch back to Login view
            signupContainer.style.display = 'none';
            loginContainer.style.display = 'block';
            
            // Auto-fill the username for convenience
            loginUsernameInput.value = username;
            loginPasswordInput.value = ""; 
        }
    });

    function showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) { el.innerText = message; el.style.display = 'block'; }
    }

    /* --- GOOGLE & GUEST BUTTONS --- */
    document.getElementById('googleBtn').addEventListener('click', () => {
        alert("Google Login API would be integrated here.");
    });

    document.getElementById('guestBtn').addEventListener('click', () => {
        localStorage.removeItem("currentUser"); // Ensure no one is logged in
        window.location.href = "index.html"; // Go straight to store
    });

    /* --- SLIDER LOGIC --- */
    const slides = document.querySelectorAll(".side-slide");
    if(slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 4000);
    }
});