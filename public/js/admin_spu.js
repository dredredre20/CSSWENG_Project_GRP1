// Sort functionality
document.getElementById('sortMenu').addEventListener('change', function(e) {
    const sortBy = e.target.value;
    const container = document.getElementById('sdwContainer');
    const buttons = Array.from(container.getElementsByTagName('button'));
    
    buttons.sort((a, b) => {
        const nameA = a.querySelector('span').textContent;
        const nameB = b.querySelector('span').textContent;
        
        // Not sure about the logic here
        if (sortBy === 'alphabetical') {
            return nameA.localeCompare(nameB);
        } else if (sortBy === 'lastupdated') {
            const dateA = new Date(a.dataset.lastUpdated || 0);
            const dateB = new Date(b.dataset.lastUpdated || 0);
            return dateB - dateA;
        }
        return 0;
    });
    
    container.innerHTML = '';
    buttons.forEach(button => container.appendChild(button));
});

// Navigate to SDW page 
function navigateToSDW(sdw_id) {
    // change url if incorrect
    window.location.href = `/sdw/${sdw_id}`;
}