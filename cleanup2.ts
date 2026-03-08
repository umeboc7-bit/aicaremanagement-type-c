import fs from 'fs';
import path from 'path';

const dir = './src/components/tools';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace print:p-0 from print-only div
    content = content.replace(/<div className="hidden print-only print:overflow-visible print:shadow-none print:border-none print:p-0 bg-white text-black font-serif p-8">/g, '<div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Done');
