import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { constants, createPrivateKey, publicEncrypt, KeyObject } from "crypto";
import { readFileSync } from "fs";

const KEY_PATH: string = "/Users/ross/Downloads/jotformv2_5520.pem";

async function encrypt(plaintext: string): Promise<string> {
  const keyMaterial: Buffer = readFileSync(KEY_PATH);
  const key: KeyObject = createPrivateKey(keyMaterial);
  const buffer: Buffer = Buffer.from(plaintext);
  const encrypted: Buffer = publicEncrypt(
    {
      key,
      passphrase: "",
      padding: constants.RSA_PKCS1_PADDING,
    },
    buffer
  );

  return encrypted.toString("base64");
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const plaintext = req.rawBody;

  if (plaintext) {
    context.res = {
      body: await encrypt(plaintext),
    };
  } else {
    context.res = {
      status: 400,
      body: "Please pass paintext in the request body",
    };
  }
};

export default httpTrigger;
