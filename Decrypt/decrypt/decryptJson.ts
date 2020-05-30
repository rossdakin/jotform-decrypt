import { decrypt } from '.';

const objectMap = (obj: object, fn: (v: any, k: any, i: number) => object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

async function decryptObject(input: any): Promise<any> {
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
    return await decrypt(input);
  } catch {
    // input corrupted, or not encrypted (more likely); just return the input (kind of a silent fail)
    return input;
  }
}

export async function decryptJson(inputJson: string): Promise<string> {
  const input: any = JSON.parse(inputJson);
  const output: any = await decryptObject(input);

  return JSON.stringify(output);
}
