const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const xml2js = require('xml2js');
const convert = require('xml-js');

// 工具函数1：读取 JSON 文件
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading JSON file: ${error}`);
        return null;
    }
}

function 解析并构建文档结构树() {
}

// 工具函数2：递归获取所有文档 ID
function getDocIdList(rootDir) {
    const docIdList = [];
    const walkDir = (dir) => {
        fs.readdirSync(dir).forEach((file) => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkDir(fullPath);
            } else {
                if (file === "$meta.json") return;
                docIdList.push(file.slice(0, -5));
            }
        });
    };
    walkDir(rootDir);
    return docIdList;
}

// 工具函数3：解析元数据
function parseMeta(metaFilePath) {
    const metaJson = readJsonFile(metaFilePath);
    if (!metaJson || !metaJson.meta) {
        throw new Error("Invalid or missing meta data");
    }
    const meta = JSON.parse(metaJson.meta);
    return yaml.load(meta.book.tocYml);
}

// 工具函数4：构造树结构
function buildTree(tocData) {
    let tocTree = {};
    let nodeMap = {};
    let pendingQueue = Array.from(tocData);

    const addNodeToTree = (node) => {
        node = {
            ...node,
            children: []
        }
        if (node.type === "META") {
            tocTree = {
                // 根结点
                root: node
            };
            return;
        }

        if (Object.keys(tocTree).length === 0) {
            pendingQueue.push(node);
            return;
        }

        const {uuid, parent_uuid: parentUuid, prev_uuid: prevUuid} = node;

        // 如果父节点还未在树中，延迟处理
        if (parentUuid && !(parentUuid in nodeMap)) {
            pendingQueue.push(node);
            return;
        }

        if (prevUuid && !(prevUuid in nodeMap)) {
            pendingQueue.push(node);
            return;
        }

        // 将当前节点添加到父节点的 children 中
        if (parentUuid) {
            const parent = nodeMap[parentUuid];
            parent.children.push(node);
        } else {
            tocTree.root.children.push(node);
        }

        // 注册当前节点
        nodeMap[uuid] = node;
    };

    let retries = pendingQueue.length;
    while (pendingQueue.length > 0 && retries > 0) {
        retries -= 1;
        const node = pendingQueue.shift();
        addNodeToTree(node);
    }

    if (retries === 0 && pendingQueue.length > 0) {
        throw new Error(
            "Some nodes could not be processed due to missing parent nodes."
        );
    }

    return tocTree;
}

// 工具函数5：打印树结构
function displayTree(tocTree, current = null, level = 0) {
    if (current === null) current = tocTree;

    for (const [uuid, node] of Object.entries(current)) {
        console.log("  ".repeat(level) + `- ${node.title} (UUID: ${uuid})`);
        if (node.children) {
            displayTree(tocTree, node.children, level + 1);
        }
    }
}

function 解析文档DOC() {
}

// const {host, doc, std} = editor;
//1 块类型
const FlavourTypes = {
    paragraph: "affine:paragraph", // 已覆盖
    list: "affine:list", // 已覆盖
    code: "affine:code", // 已覆盖
    latex: "affine:latex", // 已覆盖
    database: "affine:database", // 已覆盖
    image: "affine:image",
    attachment: "affine:attachment",
    bookmark: "affine:bookmark",
    divider: "affine:divider"
};

//2 数据库相关配置
const selectOptionColors = [
    {
        color: 'var(--affine-tag-red)',
        name: 'Red',
    },
    {
        color: 'var(--affine-tag-pink)',
        name: 'Pink',
    },
    {
        color: 'var(--affine-tag-orange)',
        name: 'Orange',
    },
    {
        color: 'var(--affine-tag-yellow)',
        name: 'Yellow',
    },
    {
        color: 'var(--affine-tag-green)',
        name: 'Green',
    },
    {
        color: 'var(--affine-tag-teal)',
        name: 'Teal',
    },
    {
        color: 'var(--affine-tag-blue)',
        name: 'Blue',
    },
    {
        color: 'var(--affine-tag-purple)',
        name: 'Purple',
    },
    {
        color: 'var(--affine-tag-gray)',
        name: 'Gray',
    },
    {
        color: 'var(--affine-tag-white)',
        name: 'White',
    },
];

const selectTagColorPoll = selectOptionColors.map(color => color.color);

function generateBlockIdFunc() {
    function generateUniqueTimestampId(length = 15) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const timestamp = Date.now().toString(36); // 时间戳转换为36进制，增加唯一性
        let id = timestamp;

        for (let i = timestamp.length; i < length; i++) { // 补充随机字符至指定长度
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // return doc.generateBlockId();
    return generateUniqueTimestampId();
}

//颜色自动轮询
function tagColorHelper() {
    // 仅在被定义时被初始化
    let colors = [...selectTagColorPoll];
    // 返回一个闭包函数
    return () => {
        if (colors.length === 0) {
            colors = [...selectTagColorPoll];
        }
        const index = Math.floor(Math.random() * colors.length);
        return colors.splice(index, 1)[0];
    };
}

const getTagColor = tagColorHelper();

// 这里中间处理的时候会生成一个伪database的block_json，所以这里代码会比较耦合。
function updateDatabaseBlock(tableItems) {
    let children = [];
    let props = {
        views: [
            {
                mode: "table",
                columns: [],
                filter: {
                    type: "group",
                    op: "and",
                    conditions: []
                },
                header: {
                    titleColumn: "",
                    iconColumn: "type"
                },
                id: generateBlockIdFunc(),
                name: "Table View"
            }
        ],
        title: {
            "$blocksuite:internal:text$": true,
            delta: []
        },
        cells: {},
        columns: []
    };

    let databaseModel = props;

    function tableItemToDict(tableItem, istitle = false) {

        delta = []
        deltaContent = ""
        tableItem.forEach(item => {
            if (delta.length) delta[delta.length - 1].insert += "\n";
            if (deltaContent) deltaContent += "\n";

            if ([FlavourTypes.paragraph, FlavourTypes.list].includes(item.flavour)) {
                item.props.text.delta.forEach(deltaItem => {
                    if (istitle) deltaContent += deltaItem.insert;
                    else delta.push(deltaItem);
                });
            } else if (item.flavour === FlavourTypes.code) {
                // if (istitle) deltaContent += `\`\`\`${item.props.language}\n`
                // else delta.push({insert: `\`\`\`${item.props.language}\n`});
                item.props.text.delta.forEach(deltaItem => {
                    if (istitle) deltaContent += deltaItem.insert;
                    else delta.push(deltaItem);
                });
                // if (istitle) deltaContent += `\n\`\`\``
                // else delta.push({insert: `\n\`\`\``});
            } else if (item.flavour === FlavourTypes.latex) {
                if (istitle) deltaContent += item.props.latex;
                else delta.push({insert: item.props.latex});
            }
        })

        return istitle ? deltaContent : delta;
    }

    // 分割列名称行和数据类型行
    const headers = tableItems[0];
    // 数据库表好像没有左右对齐或者居中对齐的职能。
    let titleColumnId;

    // column的键值对，key为columnId，value为column对象
    let columnsDict = {};
    // column的id列表
    let columnsId = [];
    headers.forEach((header, index) => {

        let column = {
            type: 'rich-text',
            name: tableItemToDict(header, true)
        }
        if (index === 0) {
            column = {
                ...column,
                type: 'title',
                data: {}
            };
            titleColumnId = generateBlockIdFunc();
            databaseModel.views[0].header.titleColumn = titleColumnId
        }

        let columnId;
        if (column.type !== 'title') columnId = generateBlockIdFunc();
        else columnId = titleColumnId;
        columnsDict[columnId] = column;
        columnsId.push(columnId);
        databaseModel.columns.push({
            ...column,
            id: columnId
        })
    })

    // 从lines第3行开始处理数据行
    tableItems.slice(1).forEach((tableRow) => {
        let rowId;
        let datarows = tableRow.map((cell, cellIndex) => {
            if (!cellIndex) {
                rowId = generateBlockIdFunc();
                let props = {
                    text: {
                        "$blocksuite:internal:text$": true,
                        delta: tableItemToDict(cell, false)
                    }
                }
                children.push({
                    type: "block",
                    id: rowId,
                    flavour: FlavourTypes.paragraph,
                    version: 1,
                    props: props,
                    children: []
                });
                databaseModel.cells[rowId] = Object.create(null);
                return {};
            } else {
                let props = {
                    text: {
                        "$blocksuite:internal:text$": true,
                        delta: tableItemToDict(cell, false)
                    }
                }
                return {
                    columnId: columnsId[cellIndex],
                    value: props.text
                }
            }
        })
        for (let i = 0; i < columnsId.length; i++) {
            const columnId = columnsId[i];
            if (columnsDict[columnId].type === 'title') continue;
            databaseModel.cells[rowId][columnId] = datarows[i];
        }
    });

    return {
        type: "block",
        id: generateBlockIdFunc(),
        flavour: FlavourTypes.database,
        version: 1,
        props: props,
        children: children
    }
}

function updateDatabaseBlockByDatatable(tableDict) {

    const tableSheet = tableDict.content.sheet[0];
    if (!tableSheet) {
        //todo 返回一个空数据库表，或者就返回一个占位符
        return null
    }

    let children = [];
    let props = {
        views: [
            {
                mode: "table",
                columns: [],
                filter: {
                    type: "group",
                    op: "and",
                    conditions: []
                },
                header: {
                    titleColumn: "",
                    iconColumn: "type"
                },
                id: generateBlockIdFunc(),
                name: "Table View"
            }
        ],
        title: {
            "$blocksuite:internal:text$": true,
            delta: []
        },
        cells: {},
        columns: []
    };

    // 分割列名称行和数据类型行
    const headers = tableSheet.columns;
    // column的键值对，key为columnId，value为column对象
    let columnsDict = {};
    // column的id列表
    let columnsId = [];
    // columnId和原生语雀type的映射
    let columnYuQueTypeDict = {};
    // 存储userId相关的映射
    let userIdDict = {};

    const columnTypeDict = {
        "textarea": "rich-text",
        "multiSelect": "multi-select",
        "select": "select",
        "checkbox": "checkbox",
        "progress": "progress",
        "date": "date",
        "number": "number",
        "rate":"number",
        "createdAt": "date",
        "updatedAt": "date"
        // "link": "link"

    }
    // 初始化一个空的标题列
    const titleColumnId = generateBlockIdFunc();
    const titleColumn = {
        data: {},
        id: titleColumnId,
        name: "Title",
        type: "title"
    };
    props.views[0].header.titleColumn = titleColumnId;
    // columnsDict[titleColumnId] = titleColumn;
    // columnsId.push(titleColumnId);
    props.columns.push(titleColumn);

    headers.forEach((header) => {
        let column = {
            name: header.name,
            type: header.type in columnTypeDict ? columnTypeDict[header.type] : "rich-text"
        }
        if (["select", "multiSelect"].includes(header.type)) {
            let options = [];
            header.options.forEach(opt => {
                let opt_dict = {
                    id: opt.id,
                    color: getTagColor(),
                    value: opt.value,
                };
                if (column.type === 'multiSelect') {
                    opt_dict = {
                        ...opt_dict,
                        parentId: undefined
                    }
                }
                options.push(opt_dict);
            })
            column = {
                ...column,
                data: {
                    options: options
                }
            }
        }
        else if (column.type === 'number') {
            column = {
                ...column,
                data: {
                    decimal: 0,
                    format: "number"
                }
            };
        } else {
            column = {
                ...column,
                data: {}
            };
        }
        let columnId = header.id;
        columnsDict[columnId] = column;
        columnYuQueTypeDict[columnId] = header.type;
        columnsId.push(columnId);
        props.columns.push({
            ...column,
            id: columnId
        })
    })

    const cells = tableDict.content.records;

    // 存储userId相关的信息
    tableDict.content.users.forEach(user => {
        userIdDict[user.id.toString()] = user
    });

    cells.forEach(row => {
        // 不属于对应表的记录跳过，不处理
        if (row["sheet_id"] !== tableSheet.id) return;
        let rowId = row.uuid;
        const rowData = JSON.parse(row.data);
        let datarows = [];
        let values;
        // 初始化标题项的内容
        children.push({
            type: "block",
            id: rowId,
            flavour: FlavourTypes.paragraph,
            version: 1,
            props: {
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: ""}]
                }
            },
            children: []
        });
        props.cells[rowId] = Object.create(null);
        for (const colKey of columnsId) {
            switch (columnYuQueTypeDict[colKey]) {
                case "textarea":
                case "email":
                case "phone":
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: {
                            "$blocksuite:internal:text$": true,
                            delta: [{insert: rowData[colKey].value}]
                        }
                    })
                    break;
                case "mention":
                    if (!(colKey in rowData)) break;
                    values = rowData[colKey].value.map(item => item.name)
                    datarows.push({
                        columnId: colKey,
                        value: {
                            "$blocksuite:internal:text$": true,
                            delta: [{insert: values.join(";")}]
                        }
                    })
                    break;
                case "date":
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: new Date(rowData[colKey].value.text).getTime()
                    })
                    break;
                case "image":
                case "file":
                    if (!(colKey in rowData)) break;
                    values = rowData[colKey].value.map(item => ({
                        insert: item.name,
                        attributes: {
                            link: item.src
                        }
                    }));
                    for (let i = 1; i < values.length; i += 2) {
                        values.splice(i, 0, {insert: ";"});  // 在每两个元素之间插入新元素
                    }
                    datarows.push({
                        columnId: colKey,
                        value: {
                            "$blocksuite:internal:text$": true,
                            delta: values
                        }
                    })
                    break;
                case "checkbox":
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: !!rowData[colKey].value
                    })
                    break;
                case "progress":
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: Math.round(rowData[colKey].value)
                    })
                    break;
                case "link":
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: {
                            "$blocksuite:internal:text$": true,
                            delta: [{
                                insert: rowData[colKey].value.name,
                                attributes: {
                                    link: rowData[colKey].value.src
                                }
                            }]
                        }
                    })
                    break;
                case "userId":
                case "modifierId":
                    datarows.push({
                        columnId: colKey,
                        value: {
                            "$blocksuite:internal:text$": true,
                            delta: [{insert: userIdDict[rowData[columnYuQueTypeDict[colKey]].toString()].name}]
                        }
                    })
                    break;
                case "createdAt":
                case "updatedAt":
                    const unixTimestampMilliseconds = new Date(rowData[columnYuQueTypeDict[colKey]]).getTime();
                    datarows.push({
                        columnId: colKey,
                        value: unixTimestampMilliseconds
                    })
                    break;
                case "rate":
                case "number":
                    datarows.push({
                        columnId: colKey,
                        value: Math.round(rowData[colKey].value)
                    })
                    break;
                default:
                    if (!(colKey in rowData)) break;
                    datarows.push({
                        columnId: colKey,
                        value: rowData[colKey].value
                    })
            }
        }
        for (let i = 0; i < datarows.length; i++) {
            const columnId = datarows[i].columnId;
            props.cells[rowId][columnId] = datarows[i];
        }
    })

    return {
        type: "block",
        id: generateBlockIdFunc(),
        flavour: FlavourTypes.database,
        version: 1,
        props: props,
        children: children
    };
}

// 格式化相关的标签，现在改用统一的处理规则
const formattedLabelsSet = new Set([
    'del', 'strong', 'u', 'a', 'code', 'em', 'sup', 'sub', 'span', 'br'
]);

const paragraphBlockLabel = ["h1", "h2", "h3", "h4", "h5", "h6", "p"];

const baseTags = new Set([
    ...paragraphBlockLabel, "blockquote", "ul", "ol", "li", "card", "br", "hr",
    "table", "tbody", "tr", "td"
])

const valid_tagname = new Set([...formattedLabelsSet, ...baseTags])

// card tag 类型的元素，需要额外创建block时的name取值
const cardTagNeedCreateBlockNameList = new Set([
    "hr", "codeblock", "math"
]);

// card其实也需要，但是card比较特殊，它的标签一般不包裹内容，内容都在属性的value中
const needGenerateBlockTag = new Set([
    ...paragraphBlockLabel, "blockquote", "li", "table", "tr", "td"
])

// 工具函数1：生成block的字典
async function generateBlockJson(block_data, curr_status) {
    // 好像只有blockquote里面开始才会有一个p，其他好像都是span

    let flavour;
    let props = {};
    let blob = {};
    const defaultImageProps = {
        caption: '',
        sourceId: '',
        width: 0,
        height: 0,
        index: 'a0',
        xywh: '[0,0,0,0]',
        rotate: 0,
        size: -1,
    };
    const defaultFileProps = {
        embed: false,
        sourceId: '',
        name: '',
        style: "horizontalThin",
        type: '',
        index: 'a0',
        xywh: '[0,0,0,0]',
        rotate: 0,
        size: -1,
    };
    if (paragraphBlockLabel.includes(block_data.type)) {
        flavour = FlavourTypes.paragraph;
        props = {
            ...props,
            type: getBlockType(curr_status).type,
            text: {
                "$blocksuite:internal:text$": true,
                delta: []
            }
        }

    } else if (block_data.type === 'li') {

        flavour = FlavourTypes.list;
        props = {
            ...props,
            type: getBlockType(curr_status).type,
            collapsed: false,
            checked: curr_status.checked || false,
            order: null,
            text: {
                "$blocksuite:internal:text$": true,
                delta: []
            }
        }
        if (curr_status.order) props = {...props, order: curr_status.order}
    } else if (block_data.type === "card") {
        if (block_data.name === "codeblock") {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);

            flavour = FlavourTypes.code;
            props = {
                ...props,
                language: parsedData.mode || "",
                wrap: parsedData.autoWrap || false,
                caption: "",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{"insert": parsedData.code}]
                }
            }
        } else if (block_data.name === "math") {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.latex;
            props = {
                ...props,
                xywh: "[0,0,16,16]",
                index: "a0",
                scale: 1,
                rotate: 0,
                latex: parsedData.code
            };
        } else if (block_data.name === 'hr') {
            flavour = FlavourTypes.divider;
            props = {};
        } else if (block_data.name === 'dataTable') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            return {
                block: updateDatabaseBlockByDatatable(parsedData),
                blob: blob
            }
        } else if (block_data.name === 'image' && !curr_status.inTd) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            // 可以加载一张图片来实现
            flavour = FlavourTypes.image;
            // 创建一个新的请求
            const response = await fetch(parsedData.src);
            // 将响应结果转换为Blob对象
            const blobObj = await response.blob();
            // 将 Blob 转换为 ArrayBuffer
            const arrayBuffer = await blobObj.arrayBuffer();
            // 使用 Buffer 将 ArrayBuffer 转换为 Base64
            const base64Result = Buffer.from(arrayBuffer).toString('base64');
            const sourceId = generateBlockIdFunc();
            blob[sourceId] = {content: base64Result, type: ""}
            props = {
                ...defaultImageProps,
                sourceId: sourceId,
                size: blobObj.size
            }
        } else if (block_data.name === 'board' && !curr_status.inTd) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            if (!parsedData.src) return {block: null, blob: blob};
            flavour = FlavourTypes.image;
            // 创建一个新的请求
            const response = await fetch(parsedData.src);
            // 将响应结果转换为Blob对象
            const blobObj = await response.blob();
            // 将 Blob 转换为 ArrayBuffer
            const arrayBuffer = await blobObj.arrayBuffer();
            // 使用 Buffer 将 ArrayBuffer 转换为 Base64
            const base64Result = Buffer.from(arrayBuffer).toString('base64');
            const sourceId = generateBlockIdFunc();
            blob[sourceId] = {content: base64Result, type: ""}
            props = {
                ...defaultImageProps,
                sourceId: sourceId,
                size: blobObj.size
            }
        } else if (block_data.name === 'file' && !curr_status.inTd) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.attachment;
            // 创建一个新的请求
            const response = await fetch(parsedData.src);
            // 将响应结果转换为Blob对象
            const blobObj = await response.blob();
            // 将 Blob 转换为 ArrayBuffer
            const arrayBuffer = await blobObj.arrayBuffer();
            // 使用 Buffer 将 ArrayBuffer 转换为 Base64
            const base64Result = Buffer.from(arrayBuffer).toString('base64');
            const sourceId = generateBlockIdFunc();
            blob[sourceId] = {content: base64Result, type: ""}
            props = {
                ...defaultFileProps,
                sourceId: sourceId,
                size: blobObj.size,
                type: response.headers.get('content-type')
            }
        } else if (block_data.name === 'imageGallery') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            const delta = parsedData.imageList.map(imageItem => ({
                insert: imageItem.name,
                attributes: {
                    link: imageItem.src
                }
            }))
            for (let i = 1; i < delta.length; i += 2) {
                delta.splice(i, 0, {insert: ";\n"});  // 在每两个元素之间插入新元素
            }
            delta.push({insert: ";"})
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: delta
                }
            }
        } else if (block_data.name === 'label') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.label, attributes:{background:getTagColor()}}]
                }
            }
        } else if (block_data.name === 'diagram') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.image;
            // 创建一个新的请求
            const response = await fetch(parsedData.url);
            // 将响应结果转换为Blob对象
            const blobObj = await response.blob();
            // 将 Blob 转换为 ArrayBuffer
            const arrayBuffer = await blobObj.arrayBuffer();
            // 使用 Buffer 将 ArrayBuffer 转换为 Base64
            const base64Result = Buffer.from(arrayBuffer).toString('base64');
            const sourceId = generateBlockIdFunc();
            blob[sourceId] = {content: base64Result, type: ""}
            props = {
                ...defaultImageProps,
                sourceId: sourceId,
                size: blobObj.size
            }
        } else if (block_data.name === 'yuqueinline') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type:"text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.detail.title,attributes:{link:parsedData.detail.url}}]
                }
            }
        } else if (block_data.name === 'calendar') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(block_data.value.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type:"text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.currentDate.toString()}]
                }
            }
        } else if (block_data.name !== 'checkbox') {
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: `[card:${block_data.name}]`}]
                }
            }
        } else return {
            block: null,
            blob: blob
        };
    } else if (block_data.type === "table") {
        flavour = FlavourTypes.database;
        props = {};
    } else {
        return {
            block: null,
            blob: blob
        };
    }

    return {
        block: {
            type: "block",
            id: generateBlockIdFunc(),
            version: 1,
            flavour: flavour,
            props: props,
            children: []
        },
        blob: blob
    };
}

// 工具函数2：更新block的内容
function updateBlockContent(block_dict, content, currstatus, front = false) {
    if (!currstatus.inSpan) return block_dict;
    attributes = {}
    if (currstatus.isEm) attributes = {italic: true};
    if (currstatus.isStrong) attributes = {...attributes, bold: true};
    if (currstatus.isDel) attributes = {...attributes, strike: true};
    if (currstatus.isCode) attributes = {...attributes, code: true};
    if (currstatus.isLink) attributes = {...attributes, link: currstatus.link};
    if (currstatus.inSpan) {
        if ('color' in currstatus.spanAttrs) attributes = {...attributes, color: currstatus.spanAttrs.color};
        if ('background-color' in currstatus.spanAttrs) attributes = {
            ...attributes,
            background: currstatus.spanAttrs["background-color"]
        };
    }
    // 这个处理阶段确保所有的delta都只有一个元素，后续再根据格式处理分割
    if (block_dict.props.type && ["h1", "h2", "h3", "h4", "h5", "h6", "text",
        "quote", "bulleted", "numbered", "todo"].includes(block_dict.props.type)) {
        if (!block_dict.props.text)
            block_dict.props = {
                ...block_dict.props,
                text: {
                    delta: []
                }
            }
        if (currstatus.blockstatus === Status.inTodo) {
            block_dict.props.type = "todo";
            block_dict.props.checked = currstatus.check;
        }
        if (front) {
            block_dict.props.text.delta.unshift({
                insert: content,
                attributes: attributes
            });
        } else {
            block_dict.props.text.delta.push({
                insert: content,
                attributes: attributes
            });
        }

    }
    // else if (['tr', 'td'].includes(block_dict.flavour)) {
    //     if (block_dict.props.text) {
    //         block_dict.props.text += content;
    //     } else {
    //         // 这里是个伪结构，所以不需要弄太复杂
    //         block_dict.props.text = content;
    //     }
    // }
}

// 工具函数3：判断栈内的block和现在的block是否匹配
function isBlockMatchedWithStack(lastTag, tagName) {
    // 使用这个函数前，前面的逻辑进行了处理，因此tagName只包含了needGenerateBlockTag的内容
    if (paragraphBlockLabel.includes(tagName) || tagName === 'blockquote') {
        if (lastTag.flavour !== FlavourTypes.paragraph) return false;
        if (lastTag.props.type === tagName) return true;
        if (lastTag.props.type === 'text' && tagName === 'p') return true;
        if (lastTag.props.type === 'quote' && tagName === 'blockquote') return true;
    } else if (tagName === 'li' && lastTag.flavour === FlavourTypes.list)
        return true;
    else if (tagName === 'table' && lastTag.flavour === FlavourTypes.database)
        return true;
    else if (tagName === 'card') {
        if ([FlavourTypes.code, FlavourTypes.latex, FlavourTypes.divider].includes(lastTag.flavour))
            return true;
    }

    return false
}

function updateStatus(currstatus, tagname, isbegin, extra = null) {
    // extra 传入属性信息
    // 在处理表格内的元素的时候，不要覆盖currstatus中的层级信息。

    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagname)) {
        currstatus.blockstatus = isbegin ? Status.inTitle : Status.None;
        if (isbegin) currstatus.title = tagname;
    } else if (tagname === 'blockquote') {
        currstatus.blockstatus = isbegin ? Status.inQuote : Status.None;
    } else if (tagname === 'p') {
        if (isbegin) {
            currstatus.blockstatus = (currstatus.blockstatus === Status.inQuote)
                ? Status.inQuoteText
                : Status.inText;
        } else currstatus.blockstatus = Status.None;
    } else if (tagname === 'span') {
        currstatus.inSpan = isbegin;
        if (isbegin) {
            currstatus.spanAttrs = {}
            let spanStyle = extra.style ? extra.style : "";
            // ?= 正向断言，不属于匹配组
            const regex = /([a-zA-Z\-]+)\s*:\s*([^;]+)\s*(?=;|$)/g;
            let match;
            // 使用exec持续向后匹配
            while ((match = regex.exec(spanStyle)) !== null) {
                currstatus.spanAttrs[match[1].trim()] = match[2].trim();
            }
        }
    } else if (tagname === 'ul') {
        currstatus.blockstatus = isbegin ? Status.inUli : Status.None;
        if (isbegin) {
            if (!currstatus.inTable) currstatus.currLevel = extra["data-lake-indent"] ? parseInt(extra["data-lake-indent"]) : 0;
        } else currstatus.currLevel = 0;
    } else if (tagname === 'ol') {
        currstatus.blockstatus = isbegin ? Status.inOli : Status.None;
        if (isbegin) {
            currstatus.order = extra.start ? parseInt(extra.start) : 1;
            if (!currstatus.inTable) currstatus.currLevel = extra["data-lake-indent"] ? parseInt(extra["data-lake-indent"]) : 0;
        } else {
            currstatus.order = 0;
            currstatus.currLevel = 0;
        }
    } else if (tagname === 'li') {
        // currstatus.inLi = isbegin;
        if (!isbegin) {
            if (currstatus.blockstatus === Status.inOli) currstatus.order++;
            if (currstatus.blockstatus === Status.inTodo) currstatus.blockstatus = Status.inUli;
        }
    } else if (tagname === 'table') {
        currstatus.inTable = isbegin;
    } else if (tagname === 'td') {
        currstatus.inTd = isbegin;
    } else if (tagname === 'strong') {
        currstatus.isStrong = isbegin;
    } else if (tagname === 'em') {
        currstatus.iaEm = isbegin;
    } else if (tagname === 'del') {
        currstatus.isDel = isbegin;
    } else if (tagname === 'code') {
        currstatus.isCode = isbegin;
    } else if (tagname === 'a') {
        currstatus.isLink = isbegin;
        currstatus.link = isbegin ? extra.href : "";
    } else if (tagname === 'card') {
        // 只处理开始时的标签
        if (isbegin && extra && extra.name === 'checkbox') {
            currstatus.blockstatus = Status.inTodo;
            const match = extra.value.trim().match(/^\s*data\s*:\s*(true|false)\s*$/i); // 宽松匹配
            const parsedValue = match ? match[1].toLowerCase() === 'true' : false; // 转为小写比较
            currstatus.check = parsedValue
        }
    }

    return currstatus
}

function getBlockType(currstatus) {
    switch (currstatus.blockstatus) {
        case Status.inTitle:
            return {type: currstatus.title};
            break;
        case Status.inTodo:
            return {type: "todo", checked: currstatus.check};
            break;
        case Status.inOli:
            return {type: "numbered", order: currstatus.order};
            break;
        case Status.inUli:
            return {type: "bulleted"};
            break;
        case Status.inText:
            return {type: "text"};
            break;
        case Status.inQuoteText:
        case Status.inQuote:
            return {type: "quote"};
            break;
        case Status.None:
            return {type: "error"};
    }
}

const Status = Object.freeze({
    None: "null",
    inOli: "numbered",
    inUli: "bulleted",
    inTodo: "todo",
    inTitle: "h",
    inText: "text",
    inQuote: "quote",
    inQuoteText: "quote"
});

// 解析语雀XML文档信息
async function parseXML(input) {
    const tagPattern = /<([^>]+)>/g;  // 正则表达式，匹配开始标签和结束标签
    const result = [];  // 用来存储最终的 JSON 结果
    let blobs = {}; //存储文件信息
    const stack = [];   // 用来存储标签栈，确保嵌套关系正确
    const indentStack = [];
    let tableItems = [];
    let tableItem = [];
    let tableRow = [];

    let index = 0;  // 指示当前处理的位置
    let currentContent = "";  // 当前标签之间的文本内容

    let currstatus = {
        // 是否在span中
        inSpan: false,
        // 是否在表格中
        inTable: false,
        // 是否在单元格中
        inTd: false,

        // 当前所在层级
        currLevel: 0,
        // 存储当前需要的indent
        indent_count: 0,

        // 块类型和相关参数
        blockstatus: Status.None,
        order: 0,
        check: false,
        title: "",

        // 文本格式相关状态
        isStrong: false,
        isEm: false,
        isDel: false,
        isCode: false,
        isLink: false,
        link: "",
        spanAttrs: {}
    }

    while (index < input.length) {
        let match = tagPattern.exec(input);
        // 处理文本内容（如果有的话）
        if (tagPattern.lastIndex > index) {
            currentContent = input.slice(index, tagPattern.lastIndex - match[0].length);
            if (currentContent.trim()) {
                // 将文本内容添加到当前栈顶元素的content
                if (currstatus.inTable && currstatus.inTd) {
                    updateBlockContent(tableItem[tableItem.length - 1], currentContent, currstatus)
                } else if (stack.length > 0) {
                    updateBlockContent(stack[stack.length - 1], currentContent, currstatus);
                }
            }
            index = tagPattern.lastIndex;
        }

        if (!match) break;

        const tag = match[1];  // 获取标签名及其属性部分
        const isEndTag = tag.startsWith("/");  // 判断是否是结束标签
        let tagName = isEndTag ? tag.slice(1) : tag.split(/\s/)[0];  // 获取标签名（去掉“/”和属性）

        // 过滤掉无效标签
        if (!valid_tagname.has(tagName)) continue;

        if (tagName === 'br') {
            // 插入一个换行符
            let lastTag = stack.pop()
            updateBlockContent(lastTag, "\n", currstatus)
            // 需要测试
            stack.push(lastTag);
        }

        if (isEndTag) {
            // 更新状态
            currstatus = updateStatus(currstatus, tagName, !isEndTag);
            // 如果不是需要生成block的tag不做处理
            if (!needGenerateBlockTag.has(tagName)) continue;

            // 数据库表相关处理
            if (currstatus.inTable && tagName !== "table") {
                if (tagName === 'tr')
                    tableItems.push(tableRow);
                if (tagName === 'td')
                    tableRow.push(tableItem);
                continue;
            }
            if (tagName === "table") {
                stack[stack.length - 1] = updateDatabaseBlock(tableItems);
            }

            // 如果是结束标签，检查栈顶元素并弹出
            let lastTag = stack.pop();
            let indent = indentStack.pop()
            // 方便我这里把一些识别不出来的块变成文本
            if (!isBlockMatchedWithStack(lastTag, tagName)) {
                // 如果栈顶标签不匹配，视作普通文本
                currentContent = match[0];
                updateBlockContent(lastTag, currentContent, currstatus)
                index = tagPattern.lastIndex;
                // 需要测试
                stack.push(lastTag);
                indentStack.push(indent);
                continue;
            } else if (tagName === 'table') {
                lastTag = updateDatabaseBlock(tableItems);
            }

            // 如果匹配，将该标签添加到结果
            // lastTag.props = setTextAttributes(lastTag.props, lastTag.flavour);

            while (indentStack.length && indentStack[indentStack.length - 1] >= currstatus.currLevel) {
                if (stack.length === 1) {
                    result.push(stack.pop());
                    indentStack.pop();
                } else {
                    stack.pop();
                    indentStack.pop()
                }
            }

            if (currstatus.currLevel > 0 && stack.length > 0) {
                const parent = stack[stack.length - 1];
                const parentIndent = indentStack[indentStack.length - 1];

                const indentGap = Math.max(0, currstatus.currLevel - parentIndent);
                updateBlockContent(lastTag, '\t'.repeat(indentGap), currstatus, front = true);
                if (!parent.children) parent.children = [];
                parent.children.push(lastTag);
            } else if (stack.length === 0) {
                updateBlockContent(lastTag, '\t'.repeat(currstatus.currLevel), currstatus, front = true);
            }

            stack.push(lastTag);
            indentStack.push(currstatus.currLevel);

        } else {
            // 如果是开始标签，创建标签对象并推入栈
            const attributes = {};
            const attributePattern = /([a-zA-Z\-]+)=(?:"([^"]*)"|([^"\s=]*))/g;
            let attrMatch;
            while ((attrMatch = attributePattern.exec(tag)) !== null) {
                // 确保引号的使用一致
                const valueWithQuotes = attrMatch[2]; // 引号包裹的值
                let valueWithoutQuotes = attrMatch[3]; // 没有引号包裹的值
                if (valueWithQuotes !== undefined && valueWithoutQuotes !== undefined) {
                    // 既有引号又无引号，不符合要求，抛出异常或处理错误逻辑
                    throw new Error(`Invalid attribute format in tag: ${tag}`);
                }
                if (!isNaN(valueWithoutQuotes) && Number.isInteger(Number(valueWithoutQuotes))) {
                    valueWithoutQuotes = parseInt(valueWithoutQuotes)
                } else if (valueWithoutQuotes === 'false') {
                    valueWithoutQuotes = false
                } else if (valueWithoutQuotes === 'true') {
                    valueWithoutQuotes = true
                }

                attributes[attrMatch[1]] = valueWithQuotes !== undefined ? valueWithQuotes : valueWithoutQuotes;
            }

            // 更新状态
            currstatus = updateStatus(currstatus, tagName, !isEndTag, attributes)

            // card类型和needGenerateBlockTag中的元素可以通过继续处理。

            const {block: tagObject, blob} = await generateBlockJson({
                ...attributes,  // 合并属性
                type: tagName,
                content: "",
            }, currstatus);

            blobs = {
                ...blobs,
                ...blob
            }
            // 如果现在是在处理表格内容，对应的p块加入到容器中
            if (currstatus.inTable && tagName !== "table") {
                if (tagName === 'td')
                    tableItem = [];
                else if (tagName === 'tr')
                    tableRow = [];
                else if (currstatus.inTd && tagObject) {
                    tableItem.push(tagObject);
                }
                continue;
            }

            // 不是一个需要实例化块的tag
            if (!tagObject) continue;
            // 处理表格内的时候不需要走下面的route，所有内容视为同一级

            if (tag.trim().slice(-1) === '/' || ['card', 'table'].includes(tagName)) {
                //标签是结束符或者属于card类型的block可以在初始阶段就拿到完整内容进行处理
                while (indentStack.length && indentStack[indentStack.length - 1] >= currstatus.currLevel) {
                    if (stack.length === 1) {
                        result.push(stack.pop());
                        indentStack.pop();
                    } else {
                        stack.pop();
                        indentStack.pop()
                    }
                }

                if (currstatus.currLevel > 0 && stack.length > 0) {
                    const parent = stack[stack.length - 1];
                    // const parentIndent = indentStack[indentStack.length - 1];
                    if (!parent.children) parent.children = [];
                    parent.children.push(tagObject);
                }
            }
            stack.push(tagObject);
            indentStack.push(currstatus.currLevel);
        }

        index = tagPattern.lastIndex;
    }

    while (stack.length > 0) {
        //todo 需要调整逻辑
        while (indentStack.length && indentStack[indentStack.length - 1] >= currstatus.currLevel) {
            if (stack.length === 1) {
                result.push(stack.pop());
                indentStack.pop();
            } else {
                stack.pop();
                indentStack.pop()
            }
        }
    }

    return {content: result, blobs: blobs};
}

// 工具函数6：解析文档信息
async function parseDoc(rootDir, docId) {
    // 最终返回一个doc的snapshot的内容
    const docPath = path.join(rootDir, `${docId}.json`);
    // 返回一个doc的json内容
    const docJson = readJsonFile(docPath);
    // xml2jsonTrial(docJson.doc["body_asl"])
    // xmlJsTrial(docJson.doc["body_asl"])
    const notenDocJson = await parseXML(docJson.doc["body_asl"])
    // console.log(docJson.doc.title)
    // console.log(notenDocJson);
    return notenDocJson;

}

// 工具函数7：解析所有文档，并返回一个包含所有文档内容的对象
function parseAllDocs(rootDir, docIds) {
    return docIds.reduce((acc, docId) => {
        const docContent = parseDoc(rootDir, docId);
        acc[docId] = docContent;  // 将 docId 和对应的内容添加到对象中
        return acc;
    }, {});
}

function xml转换相关库() {

}

function xml2jsonTrial(xmlString) {
    const parser = new xml2js.Parser();

    parser.parseString(xmlString, (err, result) => {
        if (err) throw err;
        console.log(result); // 输出JSON对象
    });
}

function xmlJsTrial(xmlString) {
    const convert = require('xml-js');

    const result = convert.xml2json(xmlString, {compact: true, spaces: 4});
    console.log(result); // 输出JSON字符串

}

function 主逻辑() {
}

// 主逻辑：解析知识库并生成树状结构
function parseKnowledgeBase(rootDir) {
    const metaFilePath = path.join(rootDir, "$meta.json");
    const docIdList = getDocIdList(rootDir);
    const tocData = parseMeta(metaFilePath);
    const tocTree = buildTree(tocData);

    return {tocTree, docIdList};
}

// 示例运行
const rootDir = "C:/home/tonghao/笔记AI/笔记 AI/0a222e1d17339829838114264148";


// const {tocTree, docIdList} = parseKnowledgeBase(rootDir);
// console.log("Document IDs:", docIdList);
// console.log("Knowledge Base Tree:");
// parseAllDocs(rootDir, docIdList)
// displayTree(tocTree);
parseDoc(rootDir, "lv9nmpboiiyt4xil").then(result => {
    // 输出这个字典的字符串表示形式
    const formattedData = JSON.stringify(result, null, 2);
    fs.writeFileSync("dictionary.txt", formattedData, "utf8");
});
