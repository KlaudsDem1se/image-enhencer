const uploadCard = document.querySelector(".upload-card");
["dragenter", "dragover", "dragleave", "drop"]
.forEach(eventName => {

    uploadCard.addEventListener(
        eventName,
        (event) => {
            event.preventDefault();
            event.stopPropagation();
        }
    );

});

["dragenter", "dragover"]
.forEach(eventName => {

    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.add("dragover");
        }
    );

});

["dragleave", "drop"]
.forEach(eventName => {

    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.remove("dragover");
        }
    );

});

function loadImage(file) {

    if (!file) return;

    const url = URL.createObjectURL(file);

    preview.src = url;

    preview.style.display = "block";

    uploadContent.style.display = "none";

    enhanceBtn.style.display = "block";
}

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    loadImage(file);

});

const button = document.getElementById("btn");
const fileInput = document.getElementById("fileInput");

const preview = document.getElementById("preview");

const uploadContent =
    document.getElementById("uploadContent");

const enhanceBtn =
    document.getElementById("enhanceBtn");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

button.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    preview.src = url;

    preview.style.display = "block";

    uploadContent.style.display = "none";

    enhanceBtn.style.display = "block";
});

enhanceBtn.addEventListener("click", () => {

    progressContainer.style.display = "block";

    progressBar.style.width = "0%";

    let progress = 0;

    const interval = setInterval(() => {

        progress += 2;

        progressBar.style.width =
            progress + "%";

        if (progress >= 100) {

            clearInterval(interval);

            alert(
                "Здесь будет запуск ML-модели"
            );
        }

    }, 50);
});

uploadCard.addEventListener("drop", (event) => {

    const file = event.dataTransfer.files[0];

    loadImage(file);

});