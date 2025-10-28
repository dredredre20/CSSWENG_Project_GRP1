document.querySelectorAll('.nav-btn').forEach(btn => {
    const category = btn.dataset.category;

    if (category) {
        btn.addEventListener('click', () => {
            window.location.href = `/reports/${encodeURIComponent(category)}`;
        });
    }
});
