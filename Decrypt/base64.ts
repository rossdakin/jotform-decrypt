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

export {
  base64Decode,
  base64Encode,
};
