import decryptChunk from './decryptChunkUsingKeyVault'; // prod
// import decryptChunk from './decryptChunkUsingLocalFile'; // dev

import { AllHtmlEntities } from 'html-entities';
const htmlEntities = new AllHtmlEntities();

// Jotform's encrypted values are concatenations of smaller encrypted chunks, joined with "#Jot#"
async function decryptLine(base64Input: string): Promise<string> {
  if (base64Input == null) {
    return base64Input;
  }

  const encryptedChunks: string[] = base64Input.split("#Jot#");
  const decryptedChunkPromises: Promise<string>[] = encryptedChunks.map(decryptChunk);
  const decryptedChunks: string[] = await Promise.all(decryptedChunkPromises);
  const decrypted: string = decryptedChunks.join("");

  return decrypted;
}

export async function decrypt(base64Input: string): Promise<string> {
  if (base64Input == null) {
    return base64Input;
  }

  const inputLines: string[] = base64Input.split(/(; )|\n/);
  const outputLines: string[] = await Promise.all(inputLines.map(decryptLine));
  const lines = outputLines.join("\n");

  // polish
  const decoded: string = htmlEntities.decode(decodeURIComponent(lines));

  return decoded;
}

export * from './decryptJson';
