import fs from 'fs';
import path from 'path';

const dir = './src/components/tools';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the <style> block that contains print-area
    content = content.replace(/<style>\{`\s*@media print \{\s*body \* \{ visibility: hidden; \}\s*\.print-area, \.print-area \* \{ visibility: visible; \}\s*\.print-area \{ position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; \}\s*\.no-print \{ display: none !important; \}\s*(@page \{[^}]+\})\s*\}\s*`\}<\/style>/g, '<style>{`\n        @media print {\n          $1\n        }\n      `}</style>');
    
    // Replace print-area class
    content = content.replace(/className="([^"]*)print-area([^"]*)"/g, 'className="$1print:overflow-visible print:shadow-none print:border-none print:p-0$2"');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Done');
