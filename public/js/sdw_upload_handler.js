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
        window.location.href = `/reports/${encodeURIComponent(category)}`;
    });
});

function handleUploadAreaEvent(event){

}

document.addEventListener("DOMContentLoaded", ()=>{
    const uploadArea = document.getElementById("uploadArea");

    const uploadModal = document.getElementById("uploadModal");
    const fileTypeModal = document.getElementById("fileTypeModal");
    const successModal = document.getElementById("successModal");

    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");

    const successFileName = document.getElementById("successFileName");
    const successReport = document.getElementById("successReport");

    const cancelBtn = document.getElementById("cancelBtn");
    const correctBtn = document.getElementById("correctBtn");
    const continueBtn = document.getElementById("continueBtn");
    const uploadAnotherBtn = document.getElementById("uploadAnotherBtn");
    const fileTypeBtn = document.getElementById("fileTypeBtn");

    let currentFile = null; //so all listeners see the file

    // to allow file drop
    uploadArea.addEventListener("dragover", (event)=>{
        event.preventDefault();
    });

    // if continue button is clicked, just remove the success modal
    continueBtn.addEventListener("click", (event) => {
        event.preventDefault();
        successModal.classList.remove("show");
    });

    // if cancel button is clicked, remove the upload modal
    cancelBtn.addEventListener("click", () => {
        uploadModal.classList.remove("show");
        currentFile = null; // reset the file
    });

    // if file added is confirmed for upload (correct button clicked)
    //only then perform adding it to the db
    correctBtn.addEventListener("click", async () => {
        if(currentFile == null){
            alert("Please select a file to upload.");
            return;
        }

        // remove the upload modal from display
        uploadModal.classList.remove("show");
        
        // prepare the data to be fetched over the /upload route
        const formData = new FormData();
        formData.append("file", currentFile);
        formData.append("report_name", currentFile.name); // added the file name for report_name db attrib
        formData.append("file_size", currentFile.size);
        formData.append("sdw_id", loggedUser.sdw_id);
        formData.append("type", report_type());

        //display it on the modal as well
        // also, the modal might need to wrap text
        fileName.textContent = currentFile.name; 
        fileSize.textContent = currentFile.size + " Bytes";

        // do the DB op
        try{
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            
            if(result.success){
                uploadModal.classList.remove("show"); //remove the upload modal again
                // display them again
                successFileName.textContent = currentFile.name;
                successReport.textContent = document.getElementById("reportSelect").value;

                successModal.classList.add("show"); //show the success modal
                currentFile = null; //reset
            }
        } catch(err){
            console.error("Upload failed:", err);
        }
    });

    fileTypeBtn.addEventListener("click", () =>{
        fileTypeModal.classList.remove("show");
        currentFile = document.getElementById("fileInputByClick").files[0];
        fileName.textContent = currentFile.name;
        fileSize.textContent = currentFile.size + " Bytes";
        uploadModal.classList.add("show");
        console.log(currentFile.type);
        
    });

    // if the user wants to upload another file
    //  currently only considers the recent file inputted
    //  since listeners are only for drag/drop events
    uploadAnotherBtn.addEventListener("click", () => {
        uploadModal.classList.remove("show");
        successModal.classList.remove("show");
        fileName.textContent = "";
        fileSize.textContent = "";
        currentFile = null;
        fileTypeModal.classList.add("show");
    });

    uploadArea.addEventListener("click", (event) => {
        event.preventDefault();
        fileTypeModal.classList.add("show");
    });

    // if the user drops a file to the upload box
    uploadArea.addEventListener("drop", (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files[0];

        if(file == null){
            return;
        }

        //set the file
        currentFile = file;
        
        fileName.textContent = file.name;
        fileSize.textContent = file.size + " Bytes";

        uploadModal.classList.add("show");
    });
});