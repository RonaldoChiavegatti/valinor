import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const root = path.resolve(__dirname, '..');
const src = path.resolve(root, 'src');
const dist = path.resolve(root, 'dist');

// Certifica-se de que o diretório dist existe
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Função para compilar um arquivo
function compileFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const relativePath = path.relative(src, filePath);
    const destPath = path.join(dist, relativePath.replace(/\.ts$/, '.js'));
    
    // Certifica-se de que o diretório de destino existe
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    exec(`npx tsc --skipLibCheck --noEmit false --declaration false --module commonjs --target es2018 --outDir ${dist} ${filePath}`, (error) => {
      if (error) {
        console.error(`Erro ao compilar ${filePath}:`, error);
        // Continue mesmo com erros
      }
      resolve();
    });
  });
}

// Função para percorrer diretórios recursivamente
async function processDirectory(dirPath: string): Promise<void> {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.spec.ts')) {
      await compileFile(fullPath);
    }
  }
}

// Iniciar a compilação
console.log('Iniciando a compilação...');
processDirectory(src)
  .then(() => {
    console.log('Compilação concluída com sucesso!');
  })
  .catch((error) => {
    console.error('Erro durante a compilação:', error);
    process.exit(1);
  }); 