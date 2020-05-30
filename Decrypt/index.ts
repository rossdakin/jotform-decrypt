import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { base64Decode } from './base64';
import { decrypt, decryptJson } from "./decrypt";

const BASE64_HEADER_NAME: string = "x-is-base64";
const INPUT_TYPE_HEADER_NAME: string = "accept";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const isBase64 = !!(req.headers[BASE64_HEADER_NAME] && JSON.parse(req.headers[BASE64_HEADER_NAME]));
  const inputType = req.headers[INPUT_TYPE_HEADER_NAME];
  const input = req.rawBody;

  if (input && inputType) {
    let decryptFn: (encrypted: string) => Promise<string> = inputType.match(/json/i) ? decryptJson : decrypt;
    let encrypted: string = isBase64 ? base64Decode(input) : input;
    let decrypted: string = await decryptFn(encrypted);

    context.res = {
      body: decrypted,
      headers: { "Content-Type": inputType },
    };
  } else {
    context.res = {
      status: 400,
      body:
        `Please pass input in request body and indicate the input content type in the ${INPUT_TYPE_HEADER_NAME} header. ` +
        `Any type can be accompanied by the ${BASE64_HEADER_NAME} header flag (set truthy if input is base64 encoded).`,
    };
  }
};

export default httpTrigger;
