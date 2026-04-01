const val = 17710755245;

console.log("Original:", val);
console.log("as milliseconds (1970?):", new Date(val).toLocaleDateString());
console.log("as seconds (*1000) (2531?):", new Date(val * 1000).toLocaleDateString());
console.log("as deciseconds (*100) (2026?):", new Date(val * 100).toLocaleDateString());
console.log("as centiseconds (*10) (1975?):", new Date(val * 10).toLocaleDateString());

const now = Date.now();
console.log("Now (ms):", now);
console.log("Now (date):", new Date(now).toLocaleDateString());
