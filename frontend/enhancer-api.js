import { loadImageFile } from './image-loader.js';

class EnhancerAPI extends EventTarget {
    constructor() {
        super();
        this.tasks = new Map();
    }

    createTask(file) {
        const taskId = crypto.randomUUID();

        this.tasks.set(taskId, {
            id: taskId,
            file,
            status: "pending",
            progress: 0,
            result: null,
            cancelled: false,
        });

        this._dispatch(taskId, "pending", 0);
        this._processTask(taskId);
        return taskId;
    }

    getTaskStatus(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        return {
            status: task.status,
            progress: task.progress
        };
    }

    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        if (task.status === "processing") {
            task.cancelled = true;
            task.status = "cancelled";
            this._dispatch(taskId, "cancelled", task.progress);
            return true;
        }
        return false;
    }

    getResult(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== "done") return null;

        return task.result;
    }

    _dispatch(taskId, status, progress) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = status;
            task.progress = progress;
            this.dispatchEvent(new CustomEvent('statuschange', {
                detail: { taskId, status, progress }
            }));
        }
    }

    async _processTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.cancelled) return;

        try {
            this._dispatch(taskId, "processing", 10);
            const bitmap = await loadImageFile(task.file);
            
            if (task.cancelled) return;

            this._dispatch(taskId, "processing", 30);
            const params = this._analyzeImage(bitmap);
            
            if (task.cancelled) return;

            this._dispatch(taskId, "processing", 60);
            const resultBlob = await this._applyEnhancements(bitmap, params, task.file.type);
            
            if (task.cancelled) return;

            task.result = resultBlob;
            this._dispatch(taskId, "done", 100);

        } catch (error) {
            console.error("Ошибка обработки:", error);
            this._dispatch(taskId, "error", 0);
        }
    }

    _analyzeImage(bitmap) {
        const maxDim = 200;
        const scale = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
        const w = Math.floor(bitmap.width * scale);
        const h = Math.floor(bitmap.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, w, h);
        
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        
        let totalBrightness = 0;
        const pixelsCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / pixelsCount;
        
        let brightnessVal = 100;
        let contrastVal = 100;
        let saturateVal = 100;

        if (avgBrightness < 100) {
            brightnessVal = 100 + (100 - avgBrightness) * 0.5;
        } else if (avgBrightness > 160) {
            brightnessVal = 100 - (avgBrightness - 160) * 0.3;
        }

        contrastVal = 110;
        saturateVal = 120;

        return { brightness: brightnessVal, contrast: contrastVal, saturate: saturateVal };
    }

    async _applyEnhancements(bitmap, params, mimeType) {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');

        ctx.filter = `brightness(${params.brightness}%) contrast(${params.contrast}%) saturate(${params.saturate}%)`;
        ctx.drawImage(bitmap, 0, 0);

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), mimeType || 'image/jpeg', 0.9);
        });
    }
}

window.EnhancerAPI = EnhancerAPI;
export default EnhancerAPI;