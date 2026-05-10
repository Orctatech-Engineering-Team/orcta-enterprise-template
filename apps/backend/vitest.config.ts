import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        // Use the node environment for compatibility with the current test suite
        environment: "node",
        globals: true,
        include: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
        exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
        // Coverage settings
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "src/**/*.test.ts",
                "**/__tests__/**",
            ],
        },
    },
});
