// Sort functionality
/*document.getElementById('sortMenu').addEventListener('change', function(e) {
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
});*/

// reimplement sorting later, it breaks currently

document.querySelectorAll('.kebab').forEach(kebab => {
    kebab.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = kebab.parentElement.nextElementSibling;
        document.querySelectorAll('.kebab-menu').forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });
        menu.classList.toggle('hidden');
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.kebab-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
});

// EDIT
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-sdw-id');
        window.location.href = `/admin/edit/${id}`;
    });
});

// DELETE - Updated with confirmation modal
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-sdw-id');
        const name = btn.closest('.user-btn').querySelector('span').textContent;
        showDeleteConfirmation(id, name);
    });
});

// Custom delete confirmation modal
function showDeleteConfirmation(sdwId, sdwName) {
    currentSDW = { id: sdwId, name: sdwName };
    
    deleteConfirmModal = document.createElement('div');
    deleteConfirmModal.className = 'delete-modal';
    deleteConfirmModal.innerHTML = `
        <div class="delete-modal-content">
            <h3>Delete SDW</h3>
            <p>Are you sure you want to delete "<strong>${sdwName}</strong>"?</p>
            <p class="warning-text">This action cannot be undone.</p>
            <div class="delete-modal-buttons">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm-delete">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(deleteConfirmModal);
    
    // Add event listeners to modal buttons
    deleteConfirmModal.querySelector('.btn-cancel').addEventListener('click', closeDeleteConfirmation);
    deleteConfirmModal.querySelector('.btn-confirm-delete').addEventListener('click', confirmDelete);
    
    setTimeout(() => deleteConfirmModal.classList.add('active'), 10);
}

function closeDeleteConfirmation() {
    if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove('active');
        setTimeout(() => {
            if (deleteConfirmModal.parentNode) {
                document.body.removeChild(deleteConfirmModal);
            }
            deleteConfirmModal = null;
            currentSDW = null;
        }, 300);
    }
}

function confirmDelete() {
    if (!currentSDW) return;
    
    closeDeleteConfirmation();
    
    fetch(`/admin/delete/${currentSDW.id}`, {  
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete SDW');
        return response.json();
    })
    .then(data => {
        alert(data.message || 'SDW deleted successfully!');
        location.reload(); // Refresh the page to update the list
    })
    .catch(error => {
        console.error('Delete error:', error);
        alert('Error deleting SDW: ' + error.message);
    });
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (deleteConfirmModal && e.target === deleteConfirmModal) {
        closeDeleteConfirmation();
    }
});