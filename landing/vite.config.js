import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ base: "./", plugins: [react()], server: { proxy: { "/demo": { target: `http://127.0.0.1:${process.env.DSKET_DEMO_PORT || 5174}`, ws: true } } } });
