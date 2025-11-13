// for converting the selected report option into integer (as per the database)
function report_type(){
    const select = document.getElementById("reportSelect").value;

    switch(select){
        case "DSWD Annual Report":
            return 1;
        case "Community Profile":
            return 2;
        case "Target Vs ACC & SE":
            return 3;
        case "Caseload Masterlist":
            return 4;
        case "Education Profile":
            return 5;
        case "Assistance to Families":
            return 6;
        case "Poverty Stoplight":
            return 7;
        case "CNF Candidates":
            return 8;
        case "Retirement Candidates":
            return 9;
        case "VM Accomplishments":
            return 10;
        case "Correspondence":
            return 11;
        case "Leaders Directory":
            return 12;
        default:
            return 0;
    }
}

// Sidebar navigation - Make dynamic
document.querySelectorAll('.nav-btn').forEach(btn => {
    // Highlight active category
    if (btn.dataset.category === '<%= currentCategory %>') {
        btn.classList.add('active');
    }
    // Navigate to category
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        window.location.href = `/admin/reports/${sdw_id}/${encodeURIComponent(category)}`;
    });
});