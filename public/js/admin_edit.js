const editForm = document.getElementById("editSDWForm");
const cancelBtn = document.getElementById("cancel");
const confirmBtn = document.getElementById("confirm");
const staff_id = editForm.dataset.staffId;
let originalData = {};


// Get original data on the page
document.addEventListener("DOMContentLoaded", ()=>{

    originalData = {
        firstname: document.getElementById("firstname").value,
        middlename: document.getElementById("middlename").value,
        lastname: document.getElementById("lastname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        //spuAssignedTo: document.getElementById("spu").value
    };

});

confirmBtn.addEventListener("click", ()=> {
    // Get current values 
    const updatedData = {
        firstname: document.getElementById("firstname").value.trim(),
        middlename: document.getElementById("middlename").value.trim(),
        lastname: document.getElementById("lastname").value.trim(),
        email: document.getElementById("email").value.trim(),   
        password: document.getElementById("password").value, 
        //spu: document.getElementById("spu").value,
        //role: document.getElementById("role").value
    }

    // Check if required fields are filled
    if (!updatedData.firstname || !updatedData.lastname || !updatedData.email) {
        alert("Please fill in all required fields.");
        return;
    }

    // Regex that allows various email domains
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(updatedData.email)) {
        alert("Please enter a valid Gmail address.");
        return;
    }

    // Password regex for password validation
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (updatedData.password && !passwordPattern.test(updatedData.password)) {
        alert("Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.");
        return;
    }

    fetch(`/admin/edit/${staff_id}`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    })
    .then((response) => response.json())
    .then(data => {
        if (data.success) {
            alert("Admin details updated successfully.");
            originalData = { ...updatedData };
            // location.reload();
            window.location.href = "/admin";
        } else {
            alert("Error updating admin details: " + data.message);
        }
    })
    .catch(error => {
        alert('Error updating sdw details: ' + error.message);
    });

});


cancelBtn.addEventListener("click", ()=>{
    const currentValues = {
        firstname: document.getElementById("firstname").value,
        middlename: document.getElementById("middlename").value,
        lastname: document.getElementById("lastname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        //spu: document.getElementById("spu").value
    };

    const hasChanges = Object.keys(originalData).
                    some(key => originalData[key] !== currentValues[key]);

    if (hasChanges) {
        const confirmCancel = confirm("You have unsaved changes. Are you sure you want to cancel?");
        if (!confirmCancel) return;
    }
        window.location.href = "/admin";
});

//const roleSelect = document.getElementById("role");

//automatically hide select fields that conflict with selected role
/*
roleSelect.addEventListener("change", ()=> {
    const role = roleSelect.value;
    const spuSelect = document.getElementById("spu");
    const supervisorSelect = document.getElementById("supervisor");
    const spuDiv = document.getElementById("spuDiv");
    const supervisorDiv = document.getElementById("supervisorDiv");

    
    spuDiv.style.visibility = "visible";
    supervisorDiv.style.visibility = "visible";
    
    spuSelect.disabled = false;
    supervisorSelect.disabled = false;


    if(role == "Supervisor"){
        supervisorSelect.disabled = true;
        supervisorDiv.style.visibility = "hidden";
    }

    if(role == "Admin"){
        supervisorDiv.style.visibility = "hidden";
        supervisorSelect.disabled = true;

        spuDiv.style.visibility = "hidden";
        spuSelect.disabled = true;
        
    }

    
});
*/