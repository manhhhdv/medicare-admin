const apiAddress = import.meta.env.VITE_API_ADDRESS;

// Debug logging
console.log("API Address:", apiAddress);
console.log("Environment:", import.meta.env.MODE);

export default apiAddress;
