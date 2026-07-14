const button = document.getElementById("btn");
const fileInput = document.getElementById("fileInput");

button.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    console.log(file.name);

});

const preview = document.getElementById("preview");

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    preview.src = url;

    preview.style.display = "block";

});