res = """To send a message to the person in the current context, use chat:\nSpec:\n<chat>\n{Blocks}\n</chat>\n\nExample:\n<chat>\n<text>Hello! Here is a list:</text>\n<uli>Item 1</uli>\n<uli>Item 2</uli>\n</chat>\nMake sure to include only Block tags at the top-level of chat.\nChat should only include the following Block XML tag names unless the user explicitly asks for them: text, uli, oli, code-block, math-block.\nChat should only include the following Inline XML tag names unless the user explicitly asks for them: h2, h3, b, i, a.\n\nBlocks allowed inside <chat>:\n\n<unknown-block id={id} type={Block Type}/>\n<h1>{Inline}</h1>\n<h2>{Inline}</h2>\n<h3>{Inline}</h3>\n<text>{Inline}{Blocks}</text>\n<uli>{Inline}{Blocks}</uli> - Bulleted list item (do no wrap in ul tags)\n<oli>{Inline}{Blocks}</oli> - Numbered list item (do no wrap in ul tags)\n\n<quote>{Inline}{Blocks}</quote>\n<todo checked=\"{true|false}\">{Inline}{Blocks}</todo>\n\n<code-block language={str, lowercase name of code language}>{String, does not need to be escaped}</code-block>\n<math-block>{Inline}</math-block>\n\n<table>{<tr>{<td>{Inline}</td>...}</tr>}...</table>\n\nNesting:\nRepresent nested list items by including <uli> or <oli> blocks inside other <uli> or <oli> blocks.\nExample: <uli>Item 1<uli>Subitem 1.1</uli><uli>Subitem 1.2</uli></uli><uli>Item 2<uli>Subitem 2.1</uli></uli>\n\nNewlines and whitespace are stripped from the output. To create a new paragraph or add whitespace, use <text> blocks for each line.\n\nInline:\n{str}\n<b>{Inline}</b>\n<i>{Inline}</i>\n<s>{Inline}</s> - strikethrough\n<u>{Inline}</u> - underline\n<a href={id|url}>{Inline}</a>\n<code>{Inline}</code> - Any XML inside <code> will be treated as plain text\n<e equation=\"{Inline}\"/> - Represents a mathematical equation. Only allows LaTeX syntax."""
print(res)