const pptgen = require('pptgenjs');  // 引入PptGenJS库
const fs = require('fs');
const path = require('path');

function copySlide(ppt, slideIndex) {
  // 获取源幻灯片
  const slide = ppt.slides[slideIndex];

  // 创建一个新的幻灯片
  const slideLayout = slide.layout;  // 获取源幻灯片的布局
  const newSlide = ppt.addSlide(slideLayout);

  // 复制源幻灯片的所有形状到新幻灯片
  slide.shapes.forEach(shape => {
    if (shape.isPlaceholder) {
      const newShape = newSlide.addPlaceholder(shape.placeholderFormat.idx, shape.left, shape.top, shape.width, shape.height);
      if (shape.hasTextFrame) {
        newShape.textFrame.clear();  // 清除文本框中的内容
        shape.textFrame.paragraphs.forEach(paragraph => {
          const newParagraph = newShape.textFrame.addParagraph();
          paragraph.runs.forEach(run => {
            const newRun = newParagraph.addRun();
            newRun.text = run.text;
          });
        });
      }
    } else {
      if (shape.hasTextFrame) {
        const newShape = newSlide.addTextbox(shape.left, shape.top, shape.width, shape.height);
        newShape.textFrame.clear();
        shape.textFrame.paragraphs.forEach(paragraph => {
          const newParagraph = newShape.textFrame.addParagraph();
          paragraph.runs.forEach(run => {
            const newRun = newParagraph.addRun();
            newRun.text = run.text;
          });
        });
      } else if (shape.shapeType === 13) {  // 图片
        newSlide.addPicture(shape.image.filename, shape.left, shape.top, shape.width, shape.height);
      }
    }
  });

  return newSlide;
}

function matchPlaceholder(tag, text) {
  const pattern = new RegExp(tag + "(\\d+)", "i");

  // 获取第一个匹配项
  const match = text.match(pattern);
  if (match) {
    return parseInt(match[1], 10);  // 输出第一个匹配的数字内容
  }
  return null;
}

function fillPptContent(templateRoute, saveRoute) {
  const ppt = new pptgen.Presentation();
  ppt.load(fs.readFileSync(templateRoute));

  const contentList = [
    ["优化沟通流程", "项目旨在改善公司内部沟通，提高工作效率。"],
    ["明确项目目标", "通过PPT汇报确保团队成员对目标与成果有共同理解。"],
    ["完成需求分析", "已进行需求分析并完成初步设计，确定项目实施路径。"],
    ["搭建协作平台", "团队协作平台已搭建完成，初步测试反馈良好。"],
    ["采用AI技术", "利用AI辅助设计提高PPT制作效率与质量，集成数据分析工具。"]
  ];

  // 添加标题slide
  let newTitleSlide = copySlide(ppt, 0);
  newTitleSlide.shapes.forEach(shape => {
    if (shape.hasTextFrame) {
      shape.textFrame.paragraphs.forEach(paragraph => {
        paragraph.runs.forEach(run => {
          if (run.text.toLowerCase().includes("title")) {
            run.text = "大模型的前世今生";
          } else if (run.text.toLowerCase().includes("speaker")) {
            run.text = "JOJO";
          }
        });
      });
    }
  });

  let newIndexSlide = copySlide(ppt, 1);
  newIndexSlide.shapes.forEach(shape => {
    if (shape.hasTextFrame) {
      shape.textFrame.paragraphs.forEach(paragraph => {
        paragraph.runs.forEach(run => {
          if (run.text.toLowerCase().includes("title")) {
            run.text = "大模型的前世今生";
          } else if (run.text.toLowerCase().includes("speaker")) {
            run.text = "JOJO";
          }
        });
      });
    }
  });

  let newSubtitleSlide = copySlide(ppt, 2);
  newSubtitleSlide.shapes.forEach(shape => {
    if (shape.hasTextFrame) {
      shape.textFrame.paragraphs.forEach(paragraph => {
        paragraph.runs.forEach(run => {
          if (run.text.toLowerCase().includes("title")) {
            run.text = "Transformer介绍";
          } else if (run.text.toLowerCase().includes("order")) {
            run.text = "01";
          }
        });
      });
    }
  });

  let newContentSlide = copySlide(ppt, 3);
  newContentSlide.shapes.forEach(shape => {
    if (shape.hasTextFrame) {
      shape.textFrame.paragraphs.forEach(paragraph => {
        paragraph.runs.forEach(run => {
          let subtitleRes = matchPlaceholder("subtitle", run.text);
          let contentRes = matchPlaceholder("content", run.text);
          if (subtitleRes) {
            run.text = contentList[contentRes - 1][0];
          } else if (run.text.toLowerCase().includes("title")) {
            run.text = "1.1 Transformer发展史";
          } else if (contentRes) {
            run.text = contentList[contentRes - 1][1];
          }
        });
      });
    }
  });

  ppt.save(fs.createWriteStream(saveRoute));
}

const templateRoute = path.join(__dirname, "Template", "Design-qwen.pptx");
const saveRoute = path.join(__dirname, "GeneratedPresentations", "test.pptx");
fillPptContent(templateRoute, saveRoute);
