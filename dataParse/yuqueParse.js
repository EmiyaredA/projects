/*
 * 文件名：yuque2.js
 * 描述：基于xml转js的库来构建语雀文档的转换
 * 作者：童浩
 * 日期：2024-12-10
 */

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

function readTextFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return data;
    } catch (error) {
        console.error(`Error reading text file: ${error}`);
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

async function itemToDict(Item, istitle = false) {
    if (!Item.hasOwnProperty('$$')) {
        return istitle ? "" : [];
    }

    let {content: cellContainer} = await parseXML(Item, isLevelFocused = false);
    let delta = []
    let deltaContent = ""
    cellContainer.forEach(item => {
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

// 这里中间处理的时候会生成一个伪database的block_json，所以这里代码会比较耦合。
async function updateDatabaseBlockByTable(tableDict) {
    let children = [];
    let tableProps = {
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

    const headers = tableDict.TBODY[0]["$$"][0];
    // 数据库表好像没有左右对齐或者居中对齐的职能。
    let titleColumnId;

    // column的键值对，key为columnId，value为column对象
    let columnsDict = {};
    // column的id列表
    let columnsId = [];
    for (const header of headers['$$']) {
        const index = headers['$$'].indexOf(header);

        let column = {
            type: 'rich-text',
            name: await itemToDict(header, true)
        }
        if (index === 0) {
            column = {
                ...column,
                type: 'title',
                data: {}
            };
            titleColumnId = generateBlockIdFunc();
            tableProps.views[0].header.titleColumn = titleColumnId
        }

        let columnId;
        if (column.type !== 'title') columnId = generateBlockIdFunc();
        else columnId = titleColumnId;
        columnsDict[columnId] = column;
        columnsId.push(columnId);
        tableProps.columns.push({
            ...column,
            id: columnId
        })
    }

    const tbody = tableDict.TBODY[0]["$$"].slice(1);
    // 从lines第3行开始处理数据行
    for (const tableRow of tbody) {
        let rowId;
        let datarows = await Promise.all(
            tableRow["$$"].map(async (cell, cellIndex) => {
                if (!cellIndex) {
                    rowId = generateBlockIdFunc();
                    let props = {
                        text: {
                            "$blocksuite:internal:text$": true,
                            delta: await itemToDict(cell, false)
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
                    tableProps.cells[rowId] = Object.create(null);
                    return {};
                } else {
                    let props = {
                        text: {
                            "$blocksuite:internal:text$": true,
                            delta: await itemToDict(cell, false)
                        }
                    }
                    return {
                        columnId: columnsId[cellIndex],
                        value: props.text
                    }
                }
            })
        )
        for (let i = 0; i < columnsId.length; i++) {
            const columnId = columnsId[i];
            if (columnsDict[columnId].type === 'title') continue;
            tableProps.cells[rowId][columnId] = datarows[i];
        }
    }

    return {
        type: "block",
        id: generateBlockIdFunc(),
        flavour: FlavourTypes.database,
        version: 1,
        props: tableProps,
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
    const views = tableSheet.views;
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
        "rate": "number",
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
    props.views[0].name = views[Object.keys(views)[0]].name;
    // views.forEach(view => {
    //     let viewDict = {
    //         mode: "table",
    //         columns: [],
    //         filter: {
    //             type: "group",
    //             op: "and",
    //             conditions: []
    //         },
    //         header: {
    //             titleColumn: titleColumnId,
    //             iconColumn: "type"
    //         },
    //         id: generateBlockIdFunc(),
    //         name: view.name
    //     }
    // })
    // columnsDict[titleColumnId] = titleColumn;
    // columnsId.push(titleColumnId);
    props.columns.push(titleColumn);

    headers.forEach(header => {
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
        } else if (column.type === 'number') {
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
                case "text":
                case "input":
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
                    if (!(colKey in rowData)) break;
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

const paragraphBlockLabel = ["H1", "H2", "H3", "H4", "H5", "H6", "P"];

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

function parseKeyValueString(input) {
    const keyValuePairs = {};
    // 分割成键值对的部分，使用 `;` 或多个空格作为分隔符
    const pairs = input.split(/;|\s{2,}/);
    pairs.forEach(pair => {
        // 去掉前后空白
        pair = pair.trim();
        if (pair) {
            // 用 `:` 分割键和值
            const [key, value] = pair.split(/:(.+)/).map(str => str && str.trim());
            if (key && value) {
                keyValuePairs[key] = value;
            }
        }
    });
    return keyValuePairs;
}

function generateDelta(blockList, currAttributes) {

    if (!currAttributes) currAttributes = {};
    let delta = [];
    let isSpan;
    let attributes = {};
    // 传入一个列表，列表中
    blockList.forEach(block => {
        isSpan = false;
        switch (block["#name"]) {
            case "STRONG":
                attributes = {...currAttributes, bold: true};
                break;
            case "EM":
                attributes = {...currAttributes, italic: true};
                break;
            case 'U':
                attributes = {...currAttributes, underline: true};
                break;
            case 'DEL':
                attributes = {...currAttributes, strike: true};
                break;
            case 'CODE':
                attributes = {...currAttributes, code: true};
                break;
            case 'A':
                attributes = {...currAttributes, link: block["$"].HREF};
                break;
            case 'BR':
                isSpan = true;
                delta.push({
                    insert: "\n",
                    attributes: currAttributes
                });
                break;
            case 'SPAN':
                isSpan = true;
                let color, background;
                if ("STYLE" in block["$"]) {
                    const keyValuePairs = parseKeyValueString(block['$'].STYLE);
                    color = keyValuePairs.color;
                    background = keyValuePairs["background-color"];
                }
                attributes = {...currAttributes};
                if (color) attributes = {...attributes, color: color};
                if (background) attributes = {...attributes, background: background};
                let content = block["_"] ? block["_"] : "";
                if (block["$$"]) block["$$"].forEach(spanItem => {
                    if (spanItem["#name"] === 'BR') content += "\n";
                })
                if (content)
                    delta.push({
                        insert: content,
                        attributes: attributes
                    });
                break;
            default:
                // 未知的tag跳过不处理
                isSpan = true;
        }
        if (!isSpan)
            delta = [
                ...delta,
                ...generateDelta(
                    block["$$"],
                    attributes
                )];
    })
    return delta;
}

// 工具函数1：生成block的字典
async function generateBlockJson(blockItem, currStatus) {
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
    const blockTypeDict = {
        "P": "text"
    }
    let blockType;
    if (paragraphBlockLabel.includes(blockItem["#name"])) {
        flavour = FlavourTypes.paragraph;
        blockType = blockItem["#name"] in blockTypeDict ?
            blockTypeDict[blockItem["#name"]] :
            blockItem["#name"].toLowerCase();
        props = {
            ...props,
            type: blockType,
            text: {
                "$blocksuite:internal:text$": true,
                delta: generateDelta(blockItem["$$"])
            }
        };
        // console.log(props);
    } else if (blockItem["#name"] === 'BLOCKQUOTE') {
        flavour = FlavourTypes.paragraph;
        const blockquoteDeltaArray = await itemToDict(blockItem);
        props = {
            ...props,
            type: "quote",
            text: {
                "$blocksuite:internal:text$": true,
                delta: blockquoteDeltaArray
            }
        }
    } else if (blockItem["#name"] === 'LI') {
        // 在这里进行是否属于todo类型的判断
        let checked = false;
        let order = null;
        let blockType = currStatus.blockstatus;
        if (currStatus.blockstatus === Status.inUl && 'CARD' in blockItem) {
            blockItem.CARD.forEach(cardItem => {
                if (cardItem['$'].NAME === "checkbox") {
                    const kvPairs = parseKeyValueString(cardItem['$'].VALUE);
                    checked = (kvPairs.data === "true");
                    blockType = "todo";
                }
            })
        }
        if (currStatus.blockstatus === Status.inOl) {
            order = currStatus.order;
        }
        flavour = FlavourTypes.list;
        props = {
            ...props,
            type: blockType,
            collapsed: false,
            checked: checked,
            order: order,
            text: {
                "$blocksuite:internal:text$": true,
                delta: generateDelta(blockItem["$$"])
            }
        }
        // if (curr_status.order) props = {...props, order: curr_status.order}
    } else if (blockItem["#name"] === "CARD") {
        if (blockItem['$'].NAME === "codeblock") {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
        } else if (blockItem['$'].NAME === "math") {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
        } else if (blockItem['$'].NAME === 'hr') {
            flavour = FlavourTypes.divider;
            props = {};
        } else if (blockItem['$'].NAME === 'dataTable') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            return {
                block: updateDatabaseBlockByDatatable(parsedData),
                blob: blob
            }
        } else if (blockItem['$'].NAME === 'image' && currStatus.isLevelFocused) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
                width: parsedData.width,
                height: parsedData.height,
                sourceId: sourceId,
                size: blobObj.size
            }
        } else if (blockItem['$'].NAME === 'board' && currStatus.isLevelFocused) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
        } else if (blockItem['$'].NAME === 'file' && currStatus.isLevelFocused) {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
                type: response.headers.get('content-type'),
                name: parsedData.name
            }
        } else if (blockItem['$'].NAME === 'imageGallery') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
        } else if (blockItem['$'].NAME === 'label') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.label, attributes: {background: getTagColor()}}]
                }
            }
        } else if (blockItem['$'].NAME === 'diagram') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
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
        } else if (blockItem['$'].NAME === 'yuqueinline') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.detail.title, attributes: {link: parsedData.detail.url}}]
                }
            }
        } else if (blockItem['$'].NAME === 'calendar') {
            // 解码 URL 编码部分
            const decodedValue = decodeURIComponent(blockItem['$'].VALUE.split('data:')[1]);
            // 解析为 JSON 对象
            const parsedData = JSON.parse(decodedValue);
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: parsedData.currentDate.toString()}]
                }
            }
        } else {
            flavour = FlavourTypes.paragraph;
            props = {
                ...props,
                type: "text",
                text: {
                    "$blocksuite:internal:text$": true,
                    delta: [{insert: `[card:${blockItem['$'].NAME}]`}]
                }
            }
        }
    } else if (blockItem["#name"] === "TABLE") {
        return {
            block: await updateDatabaseBlockByTable(blockItem),
            blob: blob
        }
    } else if (blockItem["#name"] === "SUMMARY") {
        flavour = FlavourTypes.paragraph;
        props = {
            ...props,
            type: "text",
            text: {
                "$blocksuite:internal:text$": true,
                delta: generateDelta(blockItem["$$"])
            }
        };
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


const Status = Object.freeze({
    None: "null",
    inOl: "numbered",
    inUl: "bulleted",
    // inTodo: "todo"
});


// 解析语雀XML文档信息
async function parseXML(docDict, isLevelFocused = true) {
    // 输入一个docDict，返回一个对应的blockDict的列表，考虑递归情况
    // 后续可能需要考虑传递一个状态值，记录一些属性信息
    const docContent = docDict["$$"]
    // 存储生成好的blockList列表
    let blockList = [];
    // block信息，文件二进制信息
    let blobs = {};

    // 临时值
    let block, blob;
    let blockTinyList, blobsTiny;

    // 维护一个栈，用来记录层级关系
    let stack = [];
    let currLevel = 0;

    for (const blockItem of docContent) {
        block = null;
        blob = {};
        blockTinyList = [];
        blobsTiny = {};
        currLevel = 0;
        // 根据不同tag名的block走不同的处理逻辑
        switch (blockItem["#name"]) {
            case 'H1':
            case 'H2':
            case 'H3':
            case 'H4':
            case 'H5':
            case 'H6':
            case 'BLOCKQUOTE':
                ({block, blob} = await generateBlockJson(blockItem));
                if (block) blockTinyList = [block];
                blobsTiny = blob;
                break;
            case 'P':
                if ('CARD' in blockItem) {
                    for (const cardBlock of blockItem["$$"]) {
                        if (cardBlock['#name'] !== 'CARD') continue;
                        ({block, blob} = await generateBlockJson(cardBlock, {isLevelFocused: isLevelFocused}));
                        if (block) blockTinyList.push(block);
                        blobsTiny = {...blobsTiny, ...blob};
                    }
                } else {
                    ({block, blob} = await generateBlockJson(blockItem));
                    if (block) blockTinyList = [block];
                    blobsTiny = blob;
                }
                break;
            case 'CARD':
                ({block, blob} = await generateBlockJson(blockItem, {isLevelFocused: isLevelFocused}));
                if (block) blockTinyList = [block];
                blobsTiny = blob;
                break;
            case 'UL':
                if ('DATA-LAKE-INDENT' in blockItem["$"]) currLevel = parseInt(blockItem["$"]["DATA-LAKE-INDENT"]);
                for (const liItem of blockItem["$$"]) {
                    if (liItem["#name"] !== 'LI') continue;
                    ({block, blob} = await generateBlockJson(liItem, {
                        blockstatus: Status.inUl
                    }));
                    if (block) blockTinyList.push(block);
                    blobsTiny = {...blobsTiny, ...blob};
                }
                break;
            case 'OL':
                if ('DATA-LAKE-INDENT' in blockItem["$"]) currLevel = parseInt(blockItem["$"]["DATA-LAKE-INDENT"]);
                let order = 1;
                if ("START" in blockItem['$']) {
                    order = parseInt(blockItem['$'].START);
                }
                for (const liItem of blockItem["$$"]) {
                    if (liItem["#name"] !== 'LI') continue;
                    ({block, blob} = await generateBlockJson(liItem, {
                        blockstatus: Status.inOl,
                        order: order
                    }));
                    if (block) blockTinyList.push(block);
                    blobsTiny = {...blobsTiny, ...blob};
                    order++;
                }
                break;
            case 'TABLE':
                ({block, blob} = await generateBlockJson(blockItem));
                if (block) blockTinyList = [block];
                blobsTiny = blob;
                break;
            case 'SPAN':
                if ('CARD' in blockItem) {
                    for (const cardBlock of blockItem["$$"]) {
                        if (cardBlock['#name'] !== 'CARD') continue;
                        ({block, blob} = await generateBlockJson(cardBlock, {isLevelFocused: isLevelFocused}));
                        if (block) blockTinyList.push(block);
                        blobsTiny = {...blobsTiny, ...blob};
                    }
                }
                break;
            case 'ARTICLE':
                // 分栏
                for (const articleItem of blockItem["$$"]) {
                    if (articleItem["#name"] !== "ARTICLE") continue;
                    const articleResult = await parseXML(articleItem);
                    blockTinyList = [...blockTinyList, ...articleResult.content];
                    blobsTiny = {...blobsTiny, ...articleResult.blobs};
                }
                break;
            case 'DETAILS':
                // 折叠块
                // 初六标题信息
                ({block, blob} = await generateBlockJson(blockItem['$$'][0]));
                if (block) blockTinyList.push(block);
                blobsTiny = {...blobsTiny, ...blob};
                // 处理内容信息
                const detailsResult = await parseXML(blockItem);
                blockTinyList = [...blockTinyList, ...detailsResult.content];
                blobsTiny = {...blobsTiny, ...detailsResult.blobs}
                break;
            default:
        }

        if (!blockTinyList.length) continue;

        if (isLevelFocused) {
            while (stack.length > 0 && currLevel <= stack[stack.length - 1].level) {
                if (stack.length === 1) {
                    blockList.push(stack.pop().block);
                } else stack.pop();
            }
            if (stack.length > 0) {
                stack[stack.length - 1].block.children = [
                    ...stack[stack.length - 1].block.children,
                    ...blockTinyList
                ]
            } else blockList = [...blockList, ...blockTinyList.slice(0, -1)];
            stack.push({block: blockTinyList[blockTinyList.length - 1], level: currLevel});
        } else {
            blockList = [...blockList, ...blockTinyList];
        }
        blobs = {...blobs, ...blobsTiny};
    }

    if (isLevelFocused) {
        while (stack.length > 0) {
            if (stack.length === 1) {
                blockList.push(stack.pop().block);
            } else stack.pop();
        }
    }


    return {content: blockList, blobs: blobs};
}

// 工具函数6：解析文档信息
async function parseDoc(rootDir, docId) {
    // 最终返回一个doc的snapshot的内容
    // const docPath = path.join(rootDir, `${docId}.json`);
    const docPath = path.join(rootDir, `${docId}.lake`);
    // 返回一个doc的json内容
    // const docJson = readJsonFile(docPath);
    const docJson = readTextFile(docPath);
    // const docDict = await xml2jsonTrial(docJson.doc["body_asl"])
    const docDict = await xml2jsonTrial(docJson)
    // xmlJsTrial(docJson.doc["body_asl"])
    const notenDocJson = await parseXML(docDict.ROOT)
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
    return new Promise((resolve, reject) => {
        const parser = new xml2js.Parser({
            strict: false,
            preserveChildrenOrder: true, // 保留子节点的顺序
            explicitChildren: true, // 每个元素的子元素包装成一个数组，即使它们只有一个子元素
            charsAsChildren: true, // 文本节点将被解析为子节点，而不是直接作为元素的文本内容
            // normalizeTags: false,  // 禁止标签名的大小写转换
        });
        xmlString = `<root>${xmlString}</root>`;
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                reject(err); // 出错时调用 reject
            } else {
                resolve(result); // 成功时调用 resolve
            }
        });
    });
}

function xmlJsTrial(xmlString) {
    const options = {ignoreDeclaration: true, ignoreInstruction: true};
    xmlString = `<root>${xmlString}</root>`
    const result = convert.xml2json(xmlString, options);
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
// const rootDir = "C:/home/tonghao/笔记AI/笔记 AI/0a222e1d17339829838114264148";
const rootDir = "C:/home/tonghao/backup/笔记AI/模板"

// const {tocTree, docIdList} = parseKnowledgeBase(rootDir);
// console.log("Document IDs:", docIdList);
// console.log("Knowledge Base Tree:");
// parseAllDocs(rootDir, docIdList)
// displayTree(tocTree);
parseDoc(rootDir, "产品文档 (1)").then(result => {
    // 输出这个字典的字符串表示形式
    const formattedData = JSON.stringify(result, null, 2);
    fs.writeFileSync("dictionary.txt", formattedData, "utf8");
});
// parseDoc(rootDir, "lv9nmpboiiyt4xil")