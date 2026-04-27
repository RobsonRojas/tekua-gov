export interface WatermarkData {
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

/**
 * Gets the current timestamp and geolocation data for watermarking.
 */
export const getWatermarkData = async (): Promise<WatermarkData> => {
  const data: WatermarkData = {
    timestamp: new Date().toLocaleString('pt-BR'),
  };

  try {
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      data.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    }
  } catch (err) {
    console.warn('Geolocation failed or denied:', err);
  }

  return data;
};

/**
 * Adds a watermark with timestamp and location to an image.
 */
export const addWatermarkToImage = async (
  imageBlob: Blob,
  data: WatermarkData
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      const fontSize = Math.max(24, Math.floor(img.width / 40));
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const lines = [
        `Tekuá - ${data.timestamp}`,
      ];
      
      if (data.location) {
        lines.push(`Lat: ${data.location.latitude.toFixed(6)}, Lon: ${data.location.longitude.toFixed(6)} (+/- ${data.location.accuracy.toFixed(1)}m)`);
      }

      // Calculate text background
      const lineHeight = fontSize * 1.4;
      const rectHeight = lines.length * lineHeight + fontSize;
      
      // Draw semi-transparent background for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, canvas.height - rectHeight, canvas.width, rectHeight);

      // Draw text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      lines.reverse().forEach((line, index) => {
        ctx.fillText(
          line, 
          fontSize, 
          canvas.height - fontSize - (index * lineHeight)
        );
      });

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate watermarked image'));
        }
      }, 'image/jpeg', 0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for watermarking'));
    };
    
    img.src = url;
  });
};
