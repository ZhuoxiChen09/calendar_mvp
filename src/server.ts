import "dotenv/config";
import { networkInterfaces } from "node:os";
import { app } from "./app";

const PORT = process.env.PORT || 3000;

// Helper function to get local network IP
function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInterfaces = nets[name];
    if (!netInterfaces) continue;

    for (const net of netInterfaces) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

app.listen(PORT, () => {
  const localIP = getLocalIP();
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Local: http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Network: http://${localIP}:${PORT}`);
});
