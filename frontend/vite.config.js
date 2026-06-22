import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const frontendPort = Number(env.VITE_FRONTEND_PORT) || 5174;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: env.VITE_FRONTEND_HOST || "127.0.0.1",
      port: frontendPort,
      allowedHosts: [
        'surprised-bikini-asp-suffered.trycloudflare.com',
        '.trycloudflare.com'
      ]
    },
  };
});
