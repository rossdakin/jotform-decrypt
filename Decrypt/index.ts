import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { constants, createPrivateKey, privateDecrypt, KeyObject } from "crypto";
import { readFileSync } from "fs";

const INPUT_HEADER_NAME: string = "x-jotform-input";
const KEY_PATH: string = "/Users/ross/Downloads/jotformv2_5520.pem";

const keyMaterial: Buffer = readFileSync(KEY_PATH);
const key: KeyObject = createPrivateKey(keyMaterial);

function decrypt(base64Input) {
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

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const input = req.headers[INPUT_HEADER_NAME];

  if (input) {
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: decodeURIComponent(decrypt(input)),
    };
  } else {
    context.res = {
      status: 400,
      body: `Please pass input as header ${INPUT_HEADER_NAME}`,
    };
  }
};

export default httpTrigger;
