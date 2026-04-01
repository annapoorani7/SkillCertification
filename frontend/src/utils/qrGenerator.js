import QRCode from "qrcode";

/**
 * Generates a QR Code as a Data URL (Base64 string).
 * @param {string} text - The text to encode (e.g., verification URL).
 * @returns {Promise<string>} - A promise that resolves to the Data URL.
 */
export const generateQRCode = async (text) => {
    try {
        return await QRCode.toDataURL(text, {
            margin: 1,
            color: {
                dark: "#003f87", // Primary color
                light: "#ffffff",
            },
        });
    } catch (err) {
        console.error("QR Code Generation Error:", err);
        return null;
    }
};
