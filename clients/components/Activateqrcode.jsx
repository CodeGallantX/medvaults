import api from '../assets/api'; // adjust the path as needed

export const ActivateQRCode = async () => {
  try {
    const response = await api.post('/qr/activate/');
    return response.data;
  } catch (error) {
    console.error('QR Code activation error:', error);
    throw error;
  }
};
