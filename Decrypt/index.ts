import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import decrypt from "./decrypt";

const BASE64_HEADER_NAME: string = "x-is-base64";
const INPUT_TYPE_HEADER_NAME: string = "accept";

const objectMap = (obj: object, fn: (v: any, k: any, i: number) => object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

function decryptObject(input: any): any {
  // array
  if (Array.isArray(input)) {
    return input.map(decryptObject);
  }

  // object
  if (typeof input === "object") {
    return objectMap(input, decryptObject);
  }

  // literal
  try {
    return decrypt(input);
  } catch {
    // input corrupted, or not encrypted (more likely)
    return input;
  }
}

function decryptJson(inputJson: string): string {
  const input: any = JSON.parse(inputJson);
  const output: any = decryptObject(input);

  return JSON.stringify(output);
}

function base64Decode(data: string): string {
  const buff: Buffer = Buffer.from(data, 'base64');
  const text: string = buff.toString('ascii');

  return text;
}

function base64Encode(data: string): string {
  const buff: Buffer = Buffer.from(data);
  const text: string = buff.toString('base64');

  return text;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const isBase64 = !!(req.headers[BASE64_HEADER_NAME] && JSON.parse(req.headers[BASE64_HEADER_NAME]));
  const inputType = req.headers[INPUT_TYPE_HEADER_NAME];
  const input = req.rawBody;

  if (input && inputType) {
    let decryptFn: (encrypted: string) => string = inputType.match(/json/i) ? decryptJson : decrypt;
    let encrypted: string = isBase64 ? base64Decode(input) : input;
    let decrypted: string = decryptFn(encrypted);
    let body: string = isBase64 ? base64Encode(decrypted) : decrypted;

    context.res = {
      body,
      headers: { "Content-Type": inputType },
    };
  } else {
    context.res = {
      status: 400,
      body:
        `Please pass input in request body and indicate the input content type in the ${INPUT_TYPE_HEADER_NAME} header. ` +
        `Any type can be accompanied by the ${BASE64_HEADER_NAME} header flag (set truthy if input is base64 encoded; output will be too).`,
    };
  }
};

export default httpTrigger;
