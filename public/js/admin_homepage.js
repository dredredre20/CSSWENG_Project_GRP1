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
const adminBtn = document.getElementById('view-admin').addEventListener('click', () =>{
    //console.log("Is Happen");
    window.location.href = '/admin/adminlist';
});

