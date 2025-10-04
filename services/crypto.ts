// Helper to convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generates a random salt
export const generateSalt = (len = 16): string => {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return bufferToHex(arr);
};

// Hashes a password with a given salt using SHA-256
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};
