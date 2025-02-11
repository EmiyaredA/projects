const pdf2json = require("pdf2json");
const fs = require('fs');
const pdf = require('pdf-parse');
// const puppeteer = require("puppeteer");
// const pdfjsLib = require("pdfjs-dist");

const fileRoute = `C:\\home\\tonghao\\paper\\2212.09297.pdf`

// function parsePdf() {
//     const pdfParser = new pdf2json();
//     pdfParser.on("pdfParser_dataReady", pdfData => {
//         const result = JSON.stringify(pdfData);
//         console.log(result);
//     });
//
//     pdfParser.loadPDF(fileRoute);
// }
//
// parsePdf();

// 读取 PDF 文件
const dataBuffer = fs.readFileSync(fileRoute);

// 解析 PDF
pdf(dataBuffer).then(function(data) {
  // 输出 PDF 的元数据
  console.log(data.info); // PDF 的元数据
  console.log(data.text); // 提取的文本内容
});