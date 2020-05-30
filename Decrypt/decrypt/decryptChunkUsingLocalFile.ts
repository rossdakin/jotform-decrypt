import { constants, createPrivateKey, privateDecrypt, KeyObject } from "crypto";
import { readFileSync } from "fs";

const KEY_PATH: string = "/Users/ross/Downloads/jotformv2_5520.pem";

const keyMaterial: Buffer = readFileSync(KEY_PATH);
const key: KeyObject = createPrivateKey(keyMaterial);

export default async function decryptChunkUsingLocalFile(base64Input: string): Promise<string> {
  const buffer: Buffer = Buffer.from(base64Input, "base64");
  const decrypted: Buffer = privateDecrypt(
    {
      key,
      passphrase: "",
      padding: constants.RSA_PKCS1_PADDING,
    },
    buffer
  );

  return decrypted.toString();
}
