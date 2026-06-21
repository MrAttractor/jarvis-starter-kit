import { removeBackground } from '@imgly/background-removal';

export async function cleanPhotoBackground(source, onStatus) {
  onStatus?.('Chargement du modèle…');

  const resultBlob = await removeBackground(source, {
    progress: (key, current, total) => {
      if (key.startsWith('fetch:') || key.startsWith('load:')) {
        const pct = total ? Math.round((current / total) * 100) : 0;
        onStatus?.(`Chargement… ${pct}%`);
      } else {
        onStatus?.('Traitement en cours…');
      }
    },
  });

  const img = new Image();
  const objectUrl = URL.createObjectURL(resultBlob);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = objectUrl;
  });

  const size = Math.max(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, Math.round((size - img.naturalWidth) / 2), Math.round((size - img.naturalHeight) / 2));
  URL.revokeObjectURL(objectUrl);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}
