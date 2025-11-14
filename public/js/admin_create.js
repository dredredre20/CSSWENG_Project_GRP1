const cancelBtn = document.getElementById("cancel");
const confirmBtn = document.getElementById("confirm");

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

    const sdwData = {
        firstName: firstName, 
        lastName: lastName, 
        middleName: middleName, 
        email: email, 
        password: password, 
        spuAssignedTo: spuAssignedTo 
    }

    // Not too sure about the fetch yet
    // Update with proper endpoint later
    fetch("/admin/create", {
        method: "POST", 
        //not sure about this part
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sdwData)
    })
    .then((response) => response.json())
    .then(data => {
        if (data.success) {
            alert("SDW created successfully.");
            window.location.href = "/home";
        } else {
            alert("Error updating admin details: " + data.message);
        }
    })
    .catch(error => {
        alert('Error updating sdw details: ' + error.message);
    });

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