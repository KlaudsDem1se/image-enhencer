async function loadImageFile(file) {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png' || type === 'image/bmp') {
        return await createImageBitmap(file);
    }

    if (type === 'image/heic' || type === 'image/heif') {
        return await loadHeicImage(file);
    }

    throw new Error(`Unsupported image format: ${type}`);
}

async function loadHeicImage(file) {
    try {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default || heic2anyModule;

        const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
        });
        return await createImageBitmap(blob);
    } catch (error) {
        console.error('Error loading HEIC image:', error);
        throw new Error('Failed to load HEIC image');
    }
}

export { loadImageFile };