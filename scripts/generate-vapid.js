// Generates a VAPID key pair for Web Push, using only Node's built-in crypto.
// Run: node scripts/generate-vapid.js
// Paste the output into your .env.local / Vercel environment variables.
const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' }
});

// Extract raw 65-byte uncompressed public key and raw 32-byte private key
// from the DER structures (standard offsets for prime256v1 keys).
const rawPublic = publicKey.subarray(publicKey.length - 65);
const rawPrivate = privateKey.subarray(privateKey.length - 32);

console.log('VAPID_PUBLIC_KEY=' + base64url(rawPublic));
console.log('VAPID_PRIVATE_KEY=' + base64url(rawPrivate));
console.log('\nAlso set NEXT_PUBLIC_VAPID_PUBLIC_KEY to the same value as VAPID_PUBLIC_KEY.');
