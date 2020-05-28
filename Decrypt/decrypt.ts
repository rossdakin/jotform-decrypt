import { constants, createPrivateKey, privateDecrypt, KeyObject } from "crypto";
import { readFileSync } from "fs";

const KEY_PATH: string = "PATH/TO/KEY.PEM";

const keyMaterial: Buffer = readFileSync(KEY_PATH);
const key: KeyObject = createPrivateKey(keyMaterial);

function decryptChunk(base64Input: string): string {
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

// Jotform's encrypted  values are concatenations of smaller encrypted chunks, joined with "#Jot#"
export default function decrypt(base64Input: string): string {
  const decrypted: string = base64Input.split("#Jot#").map(decryptChunk).join("");
  const decoded = decodeURIComponent(decrypted);

  return decoded;
}
