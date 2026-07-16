import EnhancerAPI from './enhancer-api.js';

const api = new EnhancerAPI();
let currentTaskId = null;

const uploadCard = document.querySelector('.upload-card');
const button = document.getElementById('btn');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadContent = document.getElementById('uploadContent');
const enhanceBtn = document.getElementById('enhanceBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const actionButtons = document.getElementById('actionButtons');
const changeBtn = document.getElementById('changeBtn');

api.addEventListener('statuschange', (event) => {
    const { taskId, status, progress } = event.detail;
    
    if (taskId !== currentTaskId) return;

    if (status === 'loading' || (status === 'processing' && progress < 30)) {
        progressBar.style.width = '10%';
    } else if (status === 'processing') {
        progressBar.style.width = `${progress}%`;
    } else if (status === 'done') {
        const result = api.getResult(taskId);
        if (result) {
            const url = URL.createObjectURL(result);
            preview.src = url;
            preview.style.display = 'block';
            uploadContent.style.display = 'none';
            actionButtons.style.display = 'flex';
            progressContainer.style.display = 'none';
        }
    } else if (status === 'error') {
        alert('Ошибка обработки изображения');
        actionButtons.style.display = 'flex';
        progressContainer.style.display = 'none';
    } else if (status === 'cancelled') {
        alert('Обработка отменена');
        actionButtons.style.display = 'flex';
        progressContainer.style.display = 'none';
    }
});

function loadImage(file) {
    if (!file) return;

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    const isImage = type.startsWith('image/') || 
                    name.endsWith('.jpg') || 
                    name.endsWith('.jpeg') || 
                    name.endsWith('.png') || 
                    name.endsWith('.bmp') || 
                    name.endsWith('.heic') || 
                    name.endsWith('.heif');

    if (!isImage) {
        alert('Пожалуйста, загрузите изображение');
        return;
    }

    if (preview.src) {
        URL.revokeObjectURL(preview.src);
    }

    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = 'block';
    
    uploadContent.style.display = 'none';
    actionButtons.style.display = 'flex';
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
}

button.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    loadImage(file);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        (event) => {
            event.preventDefault();
            event.stopPropagation();
        },
        false
    );
});

['dragenter', 'dragover'].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.add('dragover');
        },
        false
    );
});

['dragleave', 'drop'].forEach((eventName) => {
    uploadCard.addEventListener(
        eventName,
        () => {
            uploadCard.classList.remove('dragover');
        },
        false
    );
});

uploadCard.addEventListener(
    'drop',
    (event) => {
        const file = event.dataTransfer.files[0];
        loadImage(file);
    },
    false
);

enhanceBtn.addEventListener('click', () => {
    if (!fileInput.files[0]) return;

    actionButtons.style.display = 'none';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    currentTaskId = api.createTask(fileInput.files[0]);
});

changeBtn.addEventListener('click', () => {
    if (currentTaskId) {
        api.cancelTask(currentTaskId);
        currentTaskId = null;
    }
    fileInput.click();
});