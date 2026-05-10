import * as fs from "node:fs";
import * as path from "node:path";
import inquirer from "inquirer";

const TEMPLATES_DIR = path.resolve(import.meta.dirname, "templates");
const BACKEND_SRC = path.resolve(import.meta.dirname, "../..", "apps/backend/src");
const CONTEXT_DIRS = [
  "domain",
  "application/usecases",
  "api/http",
  "bootstrap/composers",
  "infrastructure/persistence",
];

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toUpperCase(str: string): string {
  return str.toUpperCase();
}

function replacePlaceholders(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  // Replace any remaining line that has {{...}} with nothing
  result = result.replaceAll(/^\s*\{\{.*\}\}\s*$/gm, "");
  return result;
}

type TemplateFile = {
  templateRel: string;
  outputRel: string;
};

const TEMPLATES: TemplateFile[] = [
  {
    templateRel: "domain/entities/entity.ts",
    outputRel: "domain/{{context}}/entities/{{Entity}}.ts",
  },
  {
    templateRel: "domain/repositories/repository.ts",
    outputRel: "domain/{{context}}/repositories/{{Entity}}Repository.ts",
  },
  {
    templateRel: "domain/queries/read-queries.ts",
    outputRel: "domain/{{context}}/queries/{{Entity}}ReadQueries.ts",
  },
  {
    templateRel: "application/usecases/create-usecase.ts",
    outputRel: "application/{{context}}/usecases/Create{{Entity}}UseCase.ts",
  },
  {
    templateRel: "api/http/controller.ts",
    outputRel: "api/http/{{context}}/{{Entity}}Controller.ts",
  },
  {
    templateRel: "api/http/routes.ts",
    outputRel: "api/http/{{context}}/{{context}}.routes.ts",
  },
  {
    templateRel: "bootstrap/composers/composer.ts",
    outputRel: "bootstrap/composers/{{context}}.ts",
  },
  {
    templateRel: "infrastructure/persistence/postgres-repository.ts",
    outputRel: "infrastructure/persistence/Postgres{{Entity}}Repository.ts",
  },
  {
    templateRel: "infrastructure/persistence/postgres-read-queries.ts",
    outputRel: "infrastructure/persistence/{{Entity}}ReadQueries.ts",
  },
  {
    templateRel: "application/usecases/__tests__/create-usecase-test.ts",
    outputRel: "application/{{context}}/usecases/__tests__/Create{{Entity}}UseCase.test.ts",
  },
];

async function main() {
  const answers = await inquirer.prompt<{ context: string; entity: string }>([
    {
      type: "input",
      name: "context",
      message: "Context name (kebab-case, e.g. dispatch):",
      validate: (input: string) => {
        const valid = /^[a-z][a-z0-9-]*$/.test(input);
        return valid || "Must be lowercase with optional hyphens (e.g. dispatch)";
      },
    },
    {
      type: "input",
      name: "entity",
      message: "Entity name (PascalCase, e.g. Rider):",
      validate: (input: string) => {
        const valid = /^[A-Z][a-zA-Z0-9]*$/.test(input);
        return valid || "Must start with uppercase letter, no spaces (e.g. Rider)";
      },
    },
  ]);

  const context = answers.context;
  const entity = answers.entity;
  const vars: Record<string, string> = {
    context,
    Context: toPascalCase(context),
    entity: toCamelCase(entity),
    Entity: entity,
  };

  const generated: string[] = [];
  const createdDirs = new Set<string>();

  for (const tmpl of TEMPLATES) {
    const templatePath = path.resolve(TEMPLATES_DIR, tmpl.templateRel);
    if (!fs.existsSync(templatePath)) {
      console.warn(`  ⚠  Template not found: ${tmpl.templateRel} — skipping`);
      continue;
    }

    const outputRel = replacePlaceholders(tmpl.outputRel, vars);
    const outputPath = path.resolve(BACKEND_SRC, outputRel);
    const outputDir = path.dirname(outputPath);

    if (!createdDirs.has(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      createdDirs.add(outputDir);
    }

    const content = fs.readFileSync(templatePath, "utf-8");
    const rendered = replacePlaceholders(content, vars);
    fs.writeFileSync(outputPath, rendered, "utf-8");
    generated.push(outputRel);
  }

  console.log("\n✓ Generated context: " + context);
  console.log(`  Entity: ${entity}`);
  console.log(`  Route prefix: /${context}s`);
  console.log("\nFiles created:");
  for (const f of generated) {
    console.log(`  • ${f}`);
  }

  console.log("\n── Manual steps ──");
  console.log("1. Add table to  apps/backend/src/infrastructure/schema/schema.ts:");
  console.log(`     export const ${context}s = pgTable("${context}s", { id, title, description, createdAt, updatedAt });`);
  console.log("2. Register routes in  apps/backend/src/api/http/app.ts:");
  console.log(`     import { register${vars.Context}Routes } from "@api/http/${context}/${context}.routes";`);
  console.log(`     register${vars.Context}Routes(app, container.${context}Controller);`);
  console.log("3. Wire composer in  apps/backend/src/bootstrap/Container.ts:");
  console.log(`     import { compose${vars.Context}Context } from "@bootstrap/composers/${context}";`);
  console.log(`     const ${context}Controller = compose${vars.Context}Context(db, eventPublisher, transaction);`);
  console.log(`     Add ${context}Controller: ${vars.Entity}Controller to AppContainer type.`);
  console.log("4. Add InMemory test double in  apps/backend/src/config/test-helpers.ts.");
  console.log("   (A working InMemory implementation is already in the generated test file.)");
  console.log();
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
