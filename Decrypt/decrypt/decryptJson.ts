import { decrypt } from '.';

async function decryptObjectEntry(entry: [string, unknown]): Promise<[string, unknown]> {
  const [key, val] = entry;
  return [key, await decryptObject(val)];
}

async function decryptObject(input: any): Promise<any> {
  // array
  if (Array.isArray(input)) {
    return Promise.all(input.map(decryptObject));
  }

  // object
  if (typeof input === "object") {
    const entries: [string, unknown][] = Object.entries(input);
    const decryptingEntries: Promise<[string, unknown]>[] = entries.map(decryptObjectEntry);
    const decryptedEntries: [string, unknown][] = await Promise.all(decryptingEntries);
    return Object.fromEntries(decryptedEntries);
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
