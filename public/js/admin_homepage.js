// Sidebar navigation - Make dynamic
document.querySelectorAll('.nav-btn').forEach(btn => {
    // Only process buttons with data-category attribute
    if (btn.dataset.category) {
        if (btn.dataset.category === '<%= currentCategory %>') {
            btn.classList.add('active');
        }
        // Navigate to category
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            window.location.href = `/admin/spu/${encodeURIComponent(category)}`;
        });
    }
});

// Handle admin list button visibility for master admin
const adminBtn = document.querySelector('.admin-btn');
const isMasterAdmin = '<%= user.role %>' === 'master_admin'; // Adjust this as needed

if (adminBtn && isMasterAdmin) {
    // Show and enable the button for master admin
    adminBtn.hidden = false;
    adminBtn.disabled = false;
    
    // Change reference if incorrect
    adminBtn.addEventListener('click', () => {
        window.location.href = '/admin/adminlist';
    });
}