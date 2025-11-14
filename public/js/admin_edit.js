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
        spuAssignedTo: document.getElementById("spu").value
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
        spu: document.getElementById("spu").value,
    }

    // Check if required fields are filled
    if (!updatedData.firstname || !updatedData.lastname || !updatedData.email || !updatedData.password) {
        alert("Please fill in all required fields.");
        return;
    }


    // Gmail regex assuming that clients will use gmail only
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(updatedData.email)) {
        alert("Please enter a valid Gmail address.");
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
            location.reload();
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
        spu: document.getElementById("spu").value
    };

    const hasChanges = Object.keys(originalData).
                    some(key => originalData[key] !== currentValues[key]);

    if (hasChanges) {
        const confirmCancel = confirm("You have unsaved changes. Are you sure you want to cancel?");
        if (!confirmCancel) return;
    }
        window.location.href = "/admin";
});

function preview(file){
    if (file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            document.getElementById("preview").src = reader.result;
        }
    }
}
