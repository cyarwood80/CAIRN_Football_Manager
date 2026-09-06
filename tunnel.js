// tunnel.js
// Launches a secure public tunnel so friends can join from anywhere in the world without deploying to cloud
import { spawn } from "child_process";

console.log("\n=======================================================");
console.log(" 🌐 LAUNCHING INSTANT PUBLIC TUNNEL FOR AGENTIC CUP");
console.log("=======================================================");
console.log("Connecting your local match server to a public HTTPS URL...");
console.log("Share this URL with your friends so they can join your lobby!\n");

// Try untun (Cloudflare Quick Tunnel)
const tunnel = spawn("npx", ["-y", "untun@latest", "tunnel", "--port", "3001"], {
  shell: true,
  stdio: "inherit"
});

tunnel.on("error", (err) => {
  console.error("Failed to start tunnel automatically:", err.message);
  console.log("Tip: You can also use ngrok: 'npx ngrok http 3001'");
});
