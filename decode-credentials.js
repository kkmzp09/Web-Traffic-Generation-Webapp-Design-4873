// Decode DataForSEO credentials
const encoded = 'a2tAam9ibWFrZXJzLmluOmQwZmZhN2RhMTMyZTI4MTk=';
const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
const [login, password] = decoded.split(':');

console.log('DataForSEO Credentials:');
console.log('Login:', login);
console.log('Password:', password);
