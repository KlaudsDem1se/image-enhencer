const uploadCard = document.querySelector(".upload-card");
const button = document.getElementById("btn");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const uploadContent = document.getElementById("uploadContent");
const enhanceBtn = document.getElementById("enhanceBtn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const actionButtons = document.getElementById("actionButtons");
const changeBtn = document.getElementById("changeBtn");

function loadImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, загрузите изображение");
        return;
    }

    if (preview.src) {
        URL.revokeObjectURL(preview.src);
    }

    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";
    
    uploadContent.style.display = "none";
    actionButtons.style.display = "flex";
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
}

button.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    loadImage(file);
});

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        (event) => {
            event.preventDefault();
            event.stopPropagation();
        },
        false
    );
});

["dragenter", "dragover"].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.add("dragover");
        },
        false
    );
});

["dragleave", "drop"].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.remove("dragover");
        },
        false
    );
});

uploadCard.addEventListener(
    "drop",
    (event) => {
        const file = event.dataTransfer.files[0];
        loadImage(file);
    },
    false
);

enhanceBtn.addEventListener("click", () => {
    actionButtons.style.display = "none";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                alert("Здесь будет запуск ML-модели");
                actionButtons.style.display = "flex";
                progressContainer.style.display = "none";
            }, 300);
        }
        
        progressBar.style.width = progress + "%";
    }, 50);
});

changeBtn.addEventListener("click", () => {
    fileInput.click();
});