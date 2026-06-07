document.addEventListener("DOMContentLoaded", () => {

    /* -------------------------------------------------------
       VIEW TOGGLE LOGIC (Login <-> Signup panel)
    ------------------------------------------------------- */
    const loginContainer  = document.getElementById('loginContainer');
    const signupContainer = document.getElementById('signupContainer');
    const showSignupLink  = document.getElementById('showSignup');
    const showLoginLink   = document.getElementById('showLogin');

    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display  = 'none';
            signupContainer.style.display = 'block';
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupContainer.style.display = 'none';
            loginContainer.style.display  = 'block';
        });
    }

    /* -------------------------------------------------------
       LOGIN LOGIC — PHP backend
    ------------------------------------------------------- */
    const loginBtn           = document.getElementById('loginBtn');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const userIn = loginUsernameInput.value.trim();
            const passIn = loginPasswordInput.value.trim();

            if (!userIn || !passIn) {
                alert("Please fill in both Username and Password fields.");
                return;
            }

            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled    = true;

            const formData = new FormData();
            formData.append('username', userIn);
            formData.append('password', passIn);

            try {
                const res  = await fetch('php/auth/login.php', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    // Store minimal user info for UI (session is the auth source of truth)
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = data.redirectTo;
                } else {
                    alert(data.error || "Invalid username or password.");
                }
            } catch (err) {
                console.error('Login error:', err);
                alert("Connection error. Make sure XAMPP is running.");
            } finally {
                loginBtn.textContent = 'Login';
                loginBtn.disabled    = false;
            }
        });
    }

    /* -------------------------------------------------------
       SIGNUP LOGIC — PHP backend
    ------------------------------------------------------- */
    const signupBtn = document.getElementById('signupBtn');

    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const firstName       = document.getElementById('firstName').value.trim();
            const lastName        = document.getElementById('lastName').value.trim();
            const username        = document.getElementById('regUsername').value.trim();
            const email           = document.getElementById('email').value.trim();
            const password        = document.getElementById('regPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            // Clear previous error messages
            document.querySelectorAll('.error-msg').forEach(el => {
                el.style.display = 'none';
                el.innerText = '';
            });

            // Client-side pre-validation
            let localValid = true;
            if (username.length < 5 || username.length > 15) {
                showError('usernameError', 'Username must be 5-15 characters');
                localValid = false;
            }
            const emailRules = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRules.test(email)) {
                showError('emailError', 'Enter a valid email');
                localValid = false;
            }
            const passwordRules = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
            if (!passwordRules.test(password)) {
                showError('passwordError', '8+ chars, 1 number & 1 uppercase');
                localValid = false;
            }
            if (password !== confirmPassword) {
                showError('confirmPasswordError', "Passwords don't match.");
                localValid = false;
            }
            if (!localValid) return;

            signupBtn.textContent = 'Creating account...';
            signupBtn.disabled    = true;

            const formData = new FormData();
            formData.append('firstName',       firstName);
            formData.append('lastName',        lastName);
            formData.append('username',        username);
            formData.append('email',           email);
            formData.append('password',        password);
            formData.append('confirmPassword', confirmPassword);

            try {
                const res  = await fetch('php/auth/register.php', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    alert("Account created successfully! Please Log In.");
                    signupContainer.style.display = 'none';
                    loginContainer.style.display  = 'block';
                    loginUsernameInput.value = username;
                    loginPasswordInput.value = '';
                } else if (data.errors) {
                    Object.entries(data.errors).forEach(([field, msg]) => {
                        const map = {
                            username: 'usernameError',
                            email:    'emailError',
                            password: 'passwordError',
                            confirmPassword: 'confirmPasswordError',
                        };
                        if (map[field]) showError(map[field], msg);
                    });
                } else {
                    alert(data.error || "Registration failed. Please try again.");
                }
            } catch (err) {
                console.error('Signup error:', err);
                alert("Connection error. Make sure XAMPP is running.");
            } finally {
                signupBtn.textContent = 'Create Account';
                signupBtn.disabled    = false;
            }
        });
    }

    /* -------------------------------------------------------
       HELPER: show field error
    ------------------------------------------------------- */
    function showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) { el.innerText = message; el.style.display = 'block'; }
    }

    /* -------------------------------------------------------
       GOOGLE & GUEST BUTTONS
    ------------------------------------------------------- */
    const googleBtn = document.getElementById('googleBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert("Google Login API would be integrated here.");
        });
    }

    const guestBtn = document.getElementById('guestBtn');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    /* -------------------------------------------------------
       SLIDER LOGIC
    ------------------------------------------------------- */
    const slides = document.querySelectorAll(".side-slide");
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 4000);
    }
});