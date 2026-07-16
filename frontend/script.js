import EnhancerAPI from './enhancer-api.js';

const api = new EnhancerAPI();
let currentTaskId = null;
let currentFile = null;

const uploadCard = document.querySelector('.upload-card');
const button = document.getElementById('btn');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadContent = document.getElementById('uploadContent');
const loadingSpinner = document.getElementById('loadingSpinner');
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

async function loadImage(file) {
    if (!file) return;

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    const isImage = type.startsWith('image/') || 
                    name.endsWith('.jpg') || name.endsWith('.jpeg') || 
                    name.endsWith('.png') || name.endsWith('.bmp') || 
                    name.endsWith('.heic') || name.endsWith('.heif');

    if (!isImage) {
        alert('Пожалуйста, загрузите изображение');
        return;
    }

    if (preview.src) {
        URL.revokeObjectURL(preview.src);
    }
    
    uploadContent.style.display = 'none';
    preview.style.display = 'none';
    actionButtons.style.display = 'none';
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'block';
    }

    const isHeic = name.endsWith('.heic') || name.endsWith('.heif') || type.includes('heic');

    try {
        if (isHeic) {
            if (!window.heic2any) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Не удалось загрузить heic2any'));
                    document.head.appendChild(script);
                });
            }
            
            const blob = await window.heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });

            const targetBlob = Array.isArray(blob) ? blob[0] : blob;
            
            currentFile = new File([targetBlob], name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg'
            });
            
            preview.src = URL.createObjectURL(targetBlob);
        } else {
            currentFile = file;
            preview.src = URL.createObjectURL(file);
        }

        if (spinner) {
            spinner.style.display = 'none';
        }
        preview.style.display = 'block';
        uploadContent.style.display = 'none';
        actionButtons.style.display = 'flex';
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить изображение');
        
        if (spinner) {
            spinner.style.display = 'none';
        }
        uploadContent.style.display = 'flex';
        actionButtons.style.display = 'none';
    }
}

button.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    await loadImage(file);
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
    async (event) => {
        const file = event.dataTransfer.files[0];
        await loadImage(file);
    },
    false
);

enhanceBtn.addEventListener('click', () => {
    if (!currentFile) return;

    actionButtons.style.display = 'none';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    currentTaskId = api.createTask(currentFile);
});

changeBtn.addEventListener('click', () => {
    if (currentTaskId) {
        api.cancelTask(currentTaskId);
        currentTaskId = null;
    }
    
    currentFile = null;
    fileInput.value = '';
    fileInput.click();
});