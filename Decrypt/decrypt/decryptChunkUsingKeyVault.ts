import { DefaultAzureCredential } from "@azure/identity";
import { KeyClient, CryptographyClient, DecryptResult } from "@azure/keyvault-keys";

const KEY_NAME: string = 'jotformv2-5520';
const KEY_VAULT_NAME: string = 'jotform';
const KEY_VAULT_URL: string = `https://${KEY_VAULT_NAME}.vault.azure.net`;

const azureCredential: DefaultAzureCredential = new DefaultAzureCredential();
const keyClient: KeyClient = new KeyClient(KEY_VAULT_URL, azureCredential);

export default async function decryptChunkUsingKeyVault(base64Input: string): Promise<string> {
  const key = await keyClient.getKey(KEY_NAME);
  const cryptographyClient = new CryptographyClient(key.id, azureCredential);
  const encryptedBuffer: Buffer = Buffer.from(base64Input, "base64");

  const decryptResult: DecryptResult = await cryptographyClient.decrypt("RSA1_5", encryptedBuffer);
  const decrypted: string = decryptResult.result.toString();

  return decrypted;
}
