const fs = require('fs');
const path = require('path');

// 修复 HTML 文件中的路径，使其适用于 Electron
function fixHtmlPaths(htmlContent) {
  // 将绝对路径改为相对路径
  return htmlContent
    // 修复 CSS 路径
    .replace(/href="\/_next\//g, 'href="./_next/')
    // 修复 JS 路径
    .replace(/src="\/_next\//g, 'src="./_next/')
    // 修复字体路径
    .replace(/href="\/_next\/static\/media\//g, 'href="./_next/static/media/')
    // 修复 preload 路径
    .replace(/href="\/_next\/static\/css\//g, 'href="./_next/static/css/')
    // 修复 webpack 脚本路径
    .replace(/href="\/_next\/static\/chunks\//g, 'href="./_next/static/chunks/')
    // 修复内联脚本中的路径
    .replace(/\/_next\/static\//g, './_next/static/')
    // 修复已经错误替换的路径
    .replace(/\.\.\/_next\//g, './_next/');
}

// 主要的 HTML 文件路径
const htmlFile = path.join(__dirname, 'out', 'index.html');

// 读取 HTML 文件
if (fs.existsSync(htmlFile)) {
  console.log('正在修复 Electron 路径...');
  
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  const fixedContent = fixHtmlPaths(htmlContent);
  
  // 写回修复后的内容
  fs.writeFileSync(htmlFile, fixedContent, 'utf8');
  
  console.log('✅ 已修复 index.html 中的路径');
} else {
  console.error('❌ 未找到 index.html 文件');
  process.exit(1);
}

// 检查并修复其他 HTML 文件
const otherHtmlFiles = ['404.html'];

otherHtmlFiles.forEach(file => {
  const filePath = path.join(__dirname, 'out', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixHtmlPaths(content);
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ 已修复 ${file} 中的路径`);
  }
});