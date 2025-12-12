// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('passwordInput');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const generalError = document.getElementById('generalError');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    generalError.classList.remove('show');
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Validate if this is correct
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = result.redirect;
        } else {
            const errorMessage = result.message || 'Invalid Email or Password';
            
            // Just show general error for all cases
            generalError.textContent = errorMessage;
            generalError.classList.add('show');
            emailInput.classList.add('input-error');
            

        }
    } catch (error) {
        console.error('Login error:', error);
        generalError.textContent = 'Invalid Credentials. Try again';
        generalError.classList.add('show');
    }
});