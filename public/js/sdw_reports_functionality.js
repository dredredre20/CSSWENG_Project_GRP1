// Store current report data
let currentReport = null;
let deleteConfirmModal = null;


// Get DOM elements
const modal = document.getElementById('previewModal');
const closeModalBtn = document.getElementById('closeModal');
const btnDownload = document.getElementById('btnDownload');
const btnDelete = document.getElementById('btnDelete');
const sortSelect = document.getElementById('sort-by');
const reportGrid = document.querySelector('.report-grid');

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
            window.location.href = `/reports/${encodeURIComponent(category)}`;
        });
    }
});
    
// Open modal when clicking on report card
document.querySelectorAll('.report-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // Don't open if clicking the options button
        if (e.target.classList.contains('report-options-btn')) {
            return;
        }
        // Might edit some of the details here
        currentReport = {
                id: this.dataset.reportId,
                name: this.dataset.reportName,
                size: this.dataset.reportSize,
                date: this.dataset.reportDate,
                uploader: this.dataset.reportUploader
            };
            openModal(currentReport);
        });
    });
    
// Open modal function
function openModal(report) {
    document.getElementById('modalFileName').textContent = report.name;
    document.getElementById('uploadDate').textContent = report.date;
    document.getElementById('fileSize').textContent = report.size;
    document.getElementById('uploader').textContent = report.uploader;


    const previewContainer = document.getElementById('previewContainer');
    const fileExt = report.name.split('.').pop().toLowerCase();

    // I think we need an external api to actually show the contents of the excel files like in gdrive
    // Placeholder for now
    // Marker: Change this
     previewContainer.innerHTML = `
        <div class="preview-placeholder">
            <div></div>
            <p>Preview not available for .${fileExt} files</p>
            <small>Click download to view the file</small>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
    
// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentReport = null;

}

// Close modal events
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
// ESC key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Download button
btnDownload.addEventListener('click', () => {
    if (currentReport) {
        // Marker: this needs more validation
        const link = document.createElement('a');
        link.href = currentReport.path || `/download/${currentReport.id}`;
        link.download = currentReport.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});


// Delete button
btnDelete.addEventListener('click', () => {
    if (currentReport) {
        showDeleteConfirmation();
    }
});

// Custom delete confirmation modal
function showDeleteConfirmation() {
    deleteConfirmModal = document.createElement('div');
    deleteConfirmModal.className = 'delete-modal';
    deleteConfirmModal.innerHTML = `
        <div class="delete-modal-content">
            <h3>Delete Report</h3>
            <p>Are you sure you want to delete "<strong>${currentReport.name}</strong>"?</p>
            <p class="warning-text">This action cannot be undone.</p>
            <div class="delete-modal-buttons">
                <button class="btn-cancel" onclick="closeDeleteConfirmation()">Cancel</button>
                <button class="btn-confirm-delete" onclick="confirmDelete()">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(deleteConfirmModal);
    setTimeout(() => deleteConfirmModal.classList.add('active'), 10);
}

function closeDeleteConfirmation() {
    if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(deleteConfirmModal);
            deleteConfirmModal = null;
        }, 300);
    }
}

function confirmDelete() {
    closeDeleteConfirmation();
    
    fetch(`/delete/${currentReport.id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete report');
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Report deleted successfully!');
        closeModal();
        location.reload();
    })
    .catch(error => {
        console.error('Delete error:', error);
        alert('Error deleting report: ' + error.message);
    });
}






// Sorting functionality
sortSelect.addEventListener('change', () => {
    const sortBy = sortSelect.value;
    const cards = Array.from(document.querySelectorAll('.report-card'));
    cards.sort((a, b) => {
        switch(sortBy) {
            case 'latest':
                return new Date(b.dataset.reportDate) - new Date(a.dataset.reportDate);
            case 'file-size': // Since we not have a measure of the size, we can remove this option
                const sizeA = parseInt(a.dataset.reportSize) || 0;
                const sizeB = parseInt(b.dataset.reportSize) || 0;
                return sizeB - sizeA;
            case 'alphabetical':
                return a.dataset.reportName.localeCompare(b.dataset.reportName);
            default:
                return 0;
        }
    });
    // Re-append sorted cards
    cards.forEach(card => reportGrid.appendChild(card));
});