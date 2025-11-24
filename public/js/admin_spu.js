// Sort functionality
document.getElementById('sortMenu').addEventListener('change', function(e) {
    const sortBy = e.target.value;
    const container = document.getElementById('sdwContainer');
    const buttons = Array.from(container.getElementsByTagName('button'));
    
    buttons.sort((a, b) => {
        const nameA = a.querySelector('span').textContent;
        const nameB = b.querySelector('span').textContent;
        
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
    window.location.href = `/admin/reports/${sdw_id}`;
}

// Kebab menu toggle
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

// EDIT - SDW
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const staffId = btn.getAttribute('data-sdw-id');
        if (staffId) {
            window.location.href = `/admin/edit/${staffId}`;
        }
    });
});

// DELETE - SDW
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const staffId = btn.getAttribute('data-sdw-id');
        const name = btn.closest('.user-btn').querySelector('span').textContent;
        if (staffId) {
            showDeleteConfirmation(staffId, name, 'SDW');
        }
    });
});

// EDIT - Supervisor
document.querySelectorAll('.edit-supervisor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const staffId = btn.getAttribute('data-supervisor-id');
        if (staffId) {
            window.location.href = `/admin/edit/${staffId}`;
        }
    });
});

// DELETE - Supervisor
document.querySelectorAll('.delete-supervisor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const staffId = btn.getAttribute('data-supervisor-id');
        const name = btn.getAttribute('data-supervisor-name');
        if (staffId) {
            showDeleteConfirmation(staffId, name, 'Supervisor');
        }
    });
});

// Variables for modal state
let deleteConfirmModal = null;
let currentItem = null;

// Custom delete confirmation modal
function showDeleteConfirmation(id, name, type) {
    currentItem = { id: id, name: name, type: type };
    
    const displayType = type === 'supervisor' ? 'Supervisor' : 'SDW';
    
    deleteConfirmModal = document.createElement('div');
    deleteConfirmModal.className = 'delete-modal';
    deleteConfirmModal.innerHTML = `
        <div class="delete-modal-content">
            <h3>Delete ${displayType}</h3>
            <p>Are you sure you want to delete "<strong>${name}</strong>"?</p>
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
            currentItem = null;
        }, 300);
    }
}

function confirmDelete() {
    if (!currentItem) return;
    
    const { id, type, name } = currentItem;
    closeDeleteConfirmation();
    
    // Backend determines type via getAccountInfo()
    fetch(`/admin/delete/${id}`, {  
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to delete ${type}`);
        return response.json();
    })
    .then(data => {
        alert(data.message || `${type} deleted successfully!`);
        location.reload();
    })
    .catch(error => {
        console.error('Delete error:', error);
        alert(`Error deleting ${type}: ${error.message}`);
    });
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (deleteConfirmModal && e.target === deleteConfirmModal) {
        closeDeleteConfirmation();
    }
});