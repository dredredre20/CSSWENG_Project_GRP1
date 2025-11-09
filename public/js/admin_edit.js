const cancelBtn = document.getElementById("cancel");
const confirmBtn = document.getElementById("confirm");
let originalData = {};


// Get original data on the page
document.addEventListener("DOMContentLoaded", ()=>{

    originalData = {
        firstName: document.getElementById("firstname").value,
        middleName: document.getElementById("middlename").value,
        lastName: document.getElementById("lastname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        spuAssignedTo: document.getElementById("spu").value
    };

});

confirmBtn.addEventListener("click", ()=> {
    // Get current values 
    const firstName = document.getElementById("firstname").value.trim();
    const middleName = document.getElementById("middlename").value.trim();  
    const lastName = document.getElementById("lastname").value.trim();  
    const email = document.getElementById("email").value.trim();    
    const password = document.getElementById("password").value;  
    const spuAssignedTo = document.getElementById("spu").value;

    // Check if required fields are filled
    if (!firstName || !lastName || !email || !password) {
        alert("Please fill in all required fields.");
        return;
    }

    // Gmail regex assuming that clients will use gmail only
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(email)) {
        alert("Please enter a valid Gmail address.");
        return;
    }

    const updatedData = {
        firstName: firstName, 
        lastName: lastName, 
        middleName: middleName, 
        email: email, 
        password: password, 
        spuAssignedTo: spuAssignedTo 
    }

    // Not too sure about the fetch yet
    // Update with proper endpoint later
    fetch("/api/admin/update", {
        method: "POST", 
        //not sure about this part
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
        firstName: document.getElementById("firstname").value,
        middleName: document.getElementById("middlename").value,
        lastName: document.getElementById("lastname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        spuAssignedTo: document.getElementById("spu").value
    };

    const hasChanges = Object.keys(originalData).
                    some(key => originalData[key] !== currentValues[key]);

    // Change this later when the routing works.
    if (hasChanges) {

        const confirmCancel = confirm("You have unsaved changes. Are you sure you want to cancel?");

        if (confirmCancel) {
            // Reset fields to original values
            document.getElementById("firstname").value = originalData.firstName;
            document.getElementById("middlename").value = originalData.middleName;
            document.getElementById("lastname").value = originalData.lastName;
            document.getElementById("email").value = originalData.email;
            document.getElementById("password").value = originalData.password;
            document.getElementById("spu").value = originalData.spuAssignedTo;
        }

        window.location.href = "/admin/homepage";
    }
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
