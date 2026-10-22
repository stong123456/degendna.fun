// Compare block identity, not provider-specific fields or JSON property order.
export function agreedBlock(headers, expectedNumber) {
  if (headers.length < 2) throw Error('Two independent RPC block headers required');
  const quantity = value => typeof value === 'string' && /^0x[0-9a-f]+$/i.test(value) ? BigInt(value) : null;
  const expected = quantity(expectedNumber);
  const first = headers[0];
  if (expected === null || !headers.every(header =>
    header && /^0x[0-9a-f]{64}$/i.test(header.hash || '') &&
    header.hash.toLowerCase() === first.hash.toLowerCase() &&
    quantity(header.number) === expected)) {
    throw Error('Independent RPC block disagreement or missing header');
  }
  return first;
}

export function commonSafeBlock(headers) {
  if (headers.length < 2 || !headers.every(header => header && /^0x[0-9a-f]+$/i.test(header.number))) {
    throw Error('Independent safe block headers unavailable');
  }
  return '0x' + headers.map(header => BigInt(header.number)).reduce((a,b) => a < b ? a : b).toString(16);
}
