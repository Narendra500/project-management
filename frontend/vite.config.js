import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "#config": path.resolve(__dirname, "./src/config"),
            "#components": path.resolve(__dirname, "./src/components"),
            "#assets": path.resolve(__dirname, "./src/assets"),
            "#pages": path.resolve(__dirname, "./src/pages"),
            "#constants": path.resolve(__dirname, "./src/constants"),
            "#services": path.resolve(__dirname, "./src/services"),
            "#contexts": path.resolve(__dirname, "./src/contexts/"),
        },
    },
});
