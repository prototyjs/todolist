export const generateId = () => {
	const array = new Uint8Array(8)
	crypto.getRandomValues(array);
	const bigIntValue = array.reduce((acc, byte) => (acc << 8n) + BigInt(byte), 0n)
	return bigIntValue.toString(36)
}