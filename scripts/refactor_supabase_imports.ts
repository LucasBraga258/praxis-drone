import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

function refactorFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Se não tem import do lib/supabase antigo, ignora
  if (!content.includes('from "../') && !content.includes('from "@/lib/supabase"')) {
      // It might use alias or relative, let's be more specific
      // We know from grep that it looks like: import { supabase } from "../../../lib/supabase"
  }
  
  const hasSupabaseImport = /import\s+\{\s*supabase\s*\}\s+from\s+['"]([^'"]*lib\/supabase)['"]/.test(content);
  if (!hasSupabaseImport) return;

  console.log("Refactoring:", filePath);

  const isClient = content.includes('"use client"') || content.includes("'use client'");

  // Replace import
  if (isClient) {
    content = content.replace(
      /import\s+\{\s*supabase\s*\}\s+from\s+['"]([^'"]*lib\/supabase)['"]/,
      'import { createClient } from "@/lib/supabase/client"'
    );
  } else {
    content = content.replace(
      /import\s+\{\s*supabase\s*\}\s+from\s+['"]([^'"]*lib\/supabase)['"]/,
      'import { createClient } from "@/lib/supabase/server"'
    );
  }

  // Find the default export function to inject `const supabase = ...`
  // Regex to match `export default function X() {` or `export default async function X() {`
  const functionRegex = /export\s+default\s+(?:async\s+)?function\s+\w*\s*\([^)]*\)\s*\{/;
  
  const match = content.match(functionRegex);
  if (match) {
    const isAsync = match[0].includes("async");
    const declaration = isAsync ? `\n  const supabase = await createClient();` : `\n  const supabase = createClient();`;
    
    // Check if it already has the declaration
    if (!content.includes("const supabase = createClient") && !content.includes("const supabase = await createClient")) {
        content = content.replace(functionRegex, `${match[0]}${declaration}`);
    }
  } else {
      // se for arrow function export default const ...
      // ou se não tiver export default, só injeta globalmente se for client?
      // Not safe. Let's just log it.
      console.log("  ⚠️ Could not find default function to inject in:", filePath);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

const dir = path.join(process.cwd(), "app", "dashboard");
const files = getAllFiles(dir);

files.forEach(refactorFile);
console.log("Done refactoring.");
