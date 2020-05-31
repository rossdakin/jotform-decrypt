import decryptChunk from './decryptChunkUsingKeyVault'; // prod
// import decryptChunk from './decryptChunkUsingLocalFile'; // dev

import { AllHtmlEntities } from 'html-entities';
const htmlEntities = new AllHtmlEntities();

// Jotform's encrypted values are concatenations of smaller encrypted chunks, joined with "#Jot#"
export async function decrypt(base64Input: string): Promise<string> {
  const encryptedChunks: string[] = base64Input.split("#Jot#");
  const decryptedChunkPromises: Promise<string>[] = encryptedChunks.map(decryptChunk);
  const decryptedChunks: string[] = await Promise.all(decryptedChunkPromises);
  const decrypted: string = decryptedChunks.join("");

  // polish
  const decoded: string = htmlEntities.decode(decodeURIComponent(decrypted));

  return decoded;
}

export * from './decryptJson';
