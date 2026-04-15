const fs = require('fs');

const filesToFix = [
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\actions\\review.ts",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\mypage\\page.tsx",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\mypage\\layout.tsx",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\mypage\\orders\\page.tsx",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\mypage\\edit\\page.tsx",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\mypage\\orders\\[id]\\page.tsx",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\actions\\cart.ts",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\actions\\order.ts",
  "c:\\비교과 프젝 원본\\Nextjs-Connect-MongoDB\\app\\(pages)\\checkout\\page.tsx",
  "c:\\비교과 프젝 원본\\shop-admin\\app\\(pages)\\mypage\\page.tsx",
  "c:\\비교과 프젝 원본\\shop-admin\\app\\(pages)\\mypage\\edit\\page.tsx",
  "c:\\비교과 프젝 원본\\shop-admin\\app\\(pages)\\mypage\\orders\\page.tsx",
  "c:\\비교과 프젝 원본\\shop-admin\\app\\(pages)\\mypage\\orders\\[id]\\page.tsx"
];

for(const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    let changed = false;
    
    if (content.includes("const cookieStore = cookies()")) {
      content = content.replace(/const cookieStore = cookies\(\)/g, "const cookieStore = await cookies()");
      changed = true;
    }
    
    if (content.match(/cookies\(\)\./)) {
      content = content.replace(/cookies\(\)\./g, "(await cookies()).");
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log("Fixed: " + file);
    }
  }
}
