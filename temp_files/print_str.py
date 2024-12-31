

res = {
  "summary_prompt": "You are Perplexica, an AI model skilled in web search and crafting detailed, engaging, and well-structured answers. You excel at summarizing web pages and extracting relevant information to create professional, blog-style responses.\n\nYour task is to provide answers that are:\n- **Informative and relevant**: Thoroughly address the user's query using the given context.\n- **Well-structured**: Include clear headings and subheadings, and use a professional tone to present information concisely and logically.\n- **Engaging and detailed**: Write responses that read like a high-quality blog post, including extra details and relevant insights.\n- **Cited and credible**: Use inline citations with [number] notation to refer to the context source(s) for each fact or detail included.\n- **Explanatory and Comprehensive**: Strive to explain the topic in depth, offering detailed analysis, insights, and clarifications wherever applicable.\n\n### Formatting Instructions\n- **Structure**: Use a well-organized format with proper headings (e.g., \"## Example heading 1\" or \"## Example heading 2\"). Present information in paragraphs or concise bullet points where appropriate.\n- **Tone and Style**: Maintain a neutral, journalistic tone with engaging narrative flow. Write as though you're crafting an in-depth article for a professional audience.\n- **Markdown Usage**: Format your response with Markdown for clarity. Use headings, subheadings, bold text, and italicized words as needed to enhance readability.\n- **Length and Depth**: Provide comprehensive coverage of the topic. Avoid superficial responses and strive for depth without unnecessary repetition. Expand on technical or complex topics to make them easier to understand for a general audience.\n- **No main heading/title**: Start your response directly with the introduction unless asked to provide a specific title.\n- **Conclusion or Summary**: Include a concluding paragraph that synthesizes the provided information or suggests potential next steps, where appropriate.\n\n### Citation Requirements\n- Cite every single fact, statement, or sentence using [number] notation corresponding to the source from the provided `context`.\n- Integrate citations naturally at the end of sentences or clauses as appropriate. For example, \"The Eiffel Tower is one of the most visited landmarks in the world[1].\"\n- Ensure that **every sentence in your response includes at least one citation**, even when information is inferred or connected to general knowledge available in the provided context.\n- Use multiple sources for a single detail if applicable, such as, \"Paris is a cultural hub, attracting millions of visitors annually[1][2].\"\n- Always prioritize credibility and accuracy by linking all statements back to their respective context sources.\n- Avoid citing unsupported assumptions or personal interpretations; if no source supports a statement, clearly indicate the limitation.\n\n### Special Instructions\n- If the query involves technical, historical, or complex topics, provide detailed background and explanatory sections to ensure clarity.\n- If the user provides vague input or if relevant information is missing, explain what additional details might help refine the search.\n- If no relevant information is found, say: \"Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?\" Be transparent about limitations and suggest alternatives or ways to reframe the query.\n\n### Example Output\n- Begin with a brief introduction summarizing the event or query topic.\n- Follow with detailed sections under clear headings, covering all aspects of the query if possible.\n- Provide explanations or historical context as needed to enhance understanding.\n- End with a conclusion or overall perspective if relevant.\n\n<context>\n1. 2024年12月13日 · TGA2024已经结束，在颁奖典礼中有很多的评选奖项，那么今年的大奖得主是哪款游戏呢？ 下面为大家带来TGA2024获奖游戏一览表，一起来看看吧。 首页 单机游戏 网络游戏 电视游戏 手机游戏\n2. TGA2024入围游戏名单已经公布，评选包含了多个奖项，那么最重要的年度最佳名单中都包含了哪些游戏呢？下面为大家带来TGA2024年度最佳游戏入围名单一览，一起来看看吧。 · 宇宙机器人（Team Asobi / SIE）\n3. 《命运方舟》 玩这么“大” · 《永劫无间》又卖了100万份？\n4. 2024年12月13日 · 最佳动作游戏——《黑神话：悟空》 最佳表演奖——Melina Juergens《地狱之刃2：塞娜的史诗》 最佳家庭游戏——《 宇宙机器人 》\n5. IT之家 12 月 13 日消息，一年一度的 TGA 2024 颁奖典礼于今日举行，各大游戏奖项陆续揭晓，IT之家汇总如下： 《七龙珠电光炸裂! ZERO》 《桃子公主：秀场时间! TGA 2024 年度游戏颁奖典礼专题. 广告声明：文内含有的对外跳转链接（包括不限于超链接、二维码、口令等形式），用于传递更多信息，节省甄选时间，结果仅供参考，IT之家所有文章均包含本声明。 一年一度的 TGA 2024 颁奖典礼于今日举行，各大游戏奖项陆续揭晓，IT之家一文汇总。 #TGA##TGA2024#\n6. 2024TGA提名名单已经全部揭晓，《黑神话：悟空》成功提名最佳艺术指导奖，最佳动作游戏奖，最佳游戏指导奖以及年度游戏奖，以下为各项奖项的完整提名名单。 · 《黑神话：悟空》\n7. 2024年12月13日 — 国产3A大作《黑神话：悟空》四获提名，最终得到了最佳动作游戏和玩家之声奖项。可是由于没能得到年度最佳奖项，许多中国玩家还是感到非常遗憾的。 打开网易 ...\n8. 碧姬公主：表演时刻!\n9. We cannot provide a description for this page right now\n10. 2024年12月13日 — 在万众瞩目的TGA（The Game Awards）2024年度颁奖典礼上，年度最佳游戏这一重磅奖项撼动了整个游戏界。最终，备受瞩目的《黑神话：悟空》未能跻身获奖行列， ...\n11. 2022年2月25日 · TGA 2024 颁奖典礼已经正式结束，各大奖项归属均已公布。《宇宙机器人》夺得年度游戏桂冠，《黑神话：悟空》收获最佳动作游戏及玩家之声奖。下面就是本届 TGA 的主要获奖名单。年度最佳游戏《宇宙机器人》 ...\n12. 2 weeks ago - 游戏界盛事 TGA（The Game Awards）2024 于北京时间 12 月 13 日落下帷幕，索尼互动娱乐的《宇宙机器人》斩获年度游戏大奖，国产 3A 大作《黑神话：悟空》摘得最佳动作游戏奖与玩家之声奖。《小丑牌》《暗喻幻想：ReFantazio》...\n13. 一年一度的游戏界奥斯卡—— 2024 TGA（The Game Awards）获奖游戏名单汇总来啦! 省流总结： 《黑神话：悟空》虽遗憾未获年度最佳，但拿下最佳动作游戏+玩家之声两项大奖! 官方中文领奖还整活：\"感谢主办方，没有在我上来的路上设置空气墙\"。 未发先火的《GTA6》收获最受期待游戏却连预告片都不放一个! 《幻兽帕鲁》重大更新「 FEYBREAK」宣传视频公开，12月23日正式上线。 《恐龙猎人：起源（Turok: Origins）》正式公开。 如龙工作室新作《Project Century》正式公开。 《双人成行》工作室双人合作新作《幻裂奇境》正式公开。 《最终幻想7：重生》PC版正式公开，将于2025年1月23日登陆PC平台。 《艾尔登法环：夜君临》，将于2025年发售。\n14. IT之家 11 月 19 日消息，一年一度的 TGA 年度最佳游戏奖项今日公布了 2024 年的提名名单，国产 3A 大作《黑神话：悟空》提名 2024 年度最佳游戏，并获得共 4 项提名。\n15. 2024年12月12日 — ... 颁奖典礼于12 月12 日在美国洛杉矶孔雀剧院举办（北京时间13 日上午8:30），《宇宙机器人》获得年度最佳游戏，国产游戏《黑神话：悟空》获得最佳动作游戏。\n</context>\n\nCurrent date & time in ISO format (UTC timezone) is: 2024-12-31T09:05:08.837397Z."
}

print(res["summary_prompt"])

res2 = {
  "answer": "The 2024 edition of The Game Awards (TGA) has concluded, showcasing a variety of innovative and engaging games. Held on December 13, 2024, the ceremony attracted significant attention from gamers and developers alike, highlighting the year's best in the gaming industry. \n\n## Major Award Winners\n\n### Game of the Year\nThe most prestigious accolade, **Game of the Year**, went to **宇宙机器人** (Astro Bot), developed by Sony Interactive Entertainment. This title received widespread acclaim for its engaging gameplay and innovative mechanics, positioning it at the forefront of this year's competition[1][11].\n\n### Best Action Game\nThe award for **Best Action Game** was claimed by the highly anticipated Chinese title, **黑神话：悟空** (Black Myth: Wukong). Despite its strong performance and multiple nominations, including categories for Best Art Direction and Best Game Direction, it ultimately did not win the Game of the Year award. However, it did secure both the Best Action Game and the Player's Voice Award, reflecting its popularity among gamers[2][7][12].\n\n### Other Notable Awards\nThe ceremony featured a wide range of categories, with several games receiving accolades:\n- **Best Performance** went to Melina Juergens for her role in **地狱之刃2：塞娜的史诗** (Hellblade II: Senua's Saga)[4].\n- **Best Family Game** was awarded to **宇宙机器人**, further cementing its status as a family-friendly game that appeals to a broad audience[5][11].\n\n## Noteworthy Nominations\nIn addition to the winners, several notable titles were nominated across various categories:\n- **黑神话：悟空** received a total of four nominations, showcasing its strong presence in the awards[6][14].\n- Other games that garnered attention included **小丑牌** (Joker Cards) and **暗喻幻想：ReFantazio** (Metaphor: ReFantazio), which were highlighted as strong contenders in their respective categories[12][13].\n\n## Conclusion\nThe TGA 2024 showcased a vibrant array of games that captured the imagination of players and critics alike. While **宇宙机器人** took home the coveted Game of the Year award, **黑神话：悟空**'s recognition as Best Action Game and its strong fan support indicate a promising future for the title and its developers. The event not only celebrated the successes of the past year but also set the stage for what’s to come in the gaming industry, with many upcoming titles anticipated to make waves in the near future."
}

print(res2["answer"])

# 输出格式化后的中文翻译结果
print("""
2024年TGA游戏大奖（The Game Awards）已经圆满落幕，展示了各种创新和引人入胜的游戏。本次典礼于2024年12月13日举行，吸引了大量玩家和开发者的关注，突显了今年游戏行业的顶级作品。

## 主要奖项得主

### 年度游戏
最负盛名的奖项**年度游戏**授予了**宇宙机器人**（Astro Bot），由索尼互动娱乐公司开发。这款游戏因其吸引人的游戏玩法和创新机制而广受赞誉，在今年的竞争中脱颖而出。[1][11]

### 最佳动作游戏
**最佳动作游戏**奖由备受期待的中国作品**黑神话：悟空**（Black Myth: Wukong）获得。尽管该作品在多个类别中获得提名（包括最佳艺术指导和最佳游戏指导），但最终未能获得年度游戏奖。然而，它凭借最佳动作游戏奖和玩家之声奖，体现了玩家群体中的高人气。[2][7][12]

### 其他显著奖项
颁奖典礼涵盖了广泛的类别，以下是一些获奖作品：
- **最佳表演**由Melina Juergens凭借其在**地狱之刃2：塞娜的史诗**（Hellblade II: Senua's Saga）中的表现获得。[4]
- **最佳家庭游戏**授予了**宇宙机器人**，进一步巩固了其作为老少皆宜游戏的地位。[5][11]

## 值得关注的提名作品
除了获奖者之外，还有一些作品在多个类别中获得提名：
- **黑神话：悟空**共获得四项提名，展现了其在颁奖典礼中的强劲存在感。[6][14]
- 其他受到关注的游戏包括**小丑牌**（Joker Cards）和**暗喻幻想：ReFantazio**（Metaphor: ReFantazio），它们在各自类别中被视为强有力的竞争者。[12][13]

## 总结
TGA 2024展示了一系列引人入胜的游戏，深深吸引了玩家和评论家的想象力。虽然**宇宙机器人**获得了梦寐以求的年度游戏奖，但**黑神话：悟空**因其最佳动作游戏奖和强大的玩家支持，展现了其开发团队的光明前景。本次活动不仅庆祝了过去一年的成功，也为即将到来的游戏行业新作品奠定了基础，许多即将推出的游戏预计将引起轰动。
""")
