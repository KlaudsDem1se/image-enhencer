async function loadImageFile(file) {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    const isStandardImage = 
        type === 'image/jpeg' || type === 'image/jpg' || 
        type === 'image/png' || type === 'image/bmp' ||
        name.endsWith('.jpg') || name.endsWith('.jpeg') || 
        name.endsWith('.png') || name.endsWith('.bmp');

    const isHeic = 
        type === 'image/heic' || type === 'image/heif' ||
        name.endsWith('.heic') || name.endsWith('.heif');

    if (isStandardImage) {
        return await createImageBitmap(file);
    }

    if (isHeic) {
        return await loadHeicImage(file);
    }

    throw new Error(`Unsupported image format: ${type || name}`);
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
        
        const targetBlob = Array.isArray(blob) ? blob[0] : blob;
        return await createImageBitmap(targetBlob);
    } catch (error) {
        console.error('Error loading HEIC image:', error);
        throw new Error('Failed to load HEIC image');
    }
}

export { loadImageFile };