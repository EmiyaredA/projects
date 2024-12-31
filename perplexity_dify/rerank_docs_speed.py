import json

class RerankDocs:
    def __init__(self, config):
        self.config = config

    def rerank_docs(
        self,
        docs: list,
        # file_ids: List[str]
    ):
        # if len(docs) == 0 and len(file_ids) == 0:
        #     return docs
        if len(docs) == 0:
            return docs

        # Step 1: 读取文件数据
        # files_data = []
        # for file_id in file_ids:
        #     file_path = os.path.join(os.getcwd(), 'uploads', file_id)
        #     content_path = file_path + '-extracted.json'
        #     embeddings_path = file_path + '-embeddings.json'
        #
        #     with open(content_path, 'r', encoding='utf-8') as f:
        #         content = json.load(f)
        #     with open(embeddings_path, 'r', encoding='utf-8') as f:
        #         embeddings_data = json.load(f)
        #
        #     file_similarity_search_object = [
        #         {
        #             'fileName': content['title'],
        #             'content': c,
        #             'embeddings': embeddings_data['embeddings'][i],
        #         }
        #         for i, c in enumerate(content['contents'])
        #     ]
        #     files_data.extend(file_similarity_search_object)

        docs_with_content = [doc for doc in docs if doc["page_content"] and len(doc["page_content"]) > 0]

        # if files_data:
        #     # 获取查询的嵌入向量
        #     query_embedding = embeddings.embed_query(query)
        #
        #     file_docs = [
        #         Document(page_content=file_data['content'], metadata={'title': file_data['fileName'], 'url': 'File'})
        #         for file_data in files_data
        #     ]
        #
        #     similarity = [
        #         {'index': i, 'similarity': compute_similarity(query_embedding, file_data['embeddings'])}
        #         for i, file_data in enumerate(files_data)
        #     ]
        #
        #     sorted_docs = sorted(
        #         [sim for sim in similarity if sim['similarity'] > (self.config.get('rerankThreshold', 0.3))],
        #         key=lambda x: x['similarity'],
        #         reverse=True
        #     )[:15]
        #
        #     sorted_docs = [file_docs[sim['index']] for sim in sorted_docs]
        #
        #     # 如果docs_with_content不为空，限制最终文档数量为 15
        #     sorted_docs = sorted_docs[:8] if docs_with_content else sorted_docs
        #     return sorted_docs + docs_with_content[:15 - len(sorted_docs)]
        #
        # else:
        return docs_with_content[:15]
def main(docs: str, config: str):
    config = json.loads(config)
    rerankDocs = RerankDocs(config)

    res_docs = rerankDocs.rerank_docs(
        docs=json.loads(docs)
    )

    return {
        "rerank_docs_str": json.dumps(res_docs, ensure_ascii=False)
    }


input_params = {
  "docs": "[{\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 完整获奖名单公布- 黑神话：悟空》最佳动作游戏\\\", \\\"url\\\": \\\"https://www.ithome.com/0/817/370.htm\\\", \\\"content\\\": \\\"IT之家 12 月 13 日消息，一年一度的 TGA 2024 颁奖典礼于今日举行，各大游戏奖项陆续揭晓，IT之家汇总如下： 《七龙珠电光炸裂! ZERO》 《桃子公主：秀场时间! TGA 2024 年度游戏颁奖典礼专题. 广告声明：文内含有的对外跳转链接（包括不限于超链接、二维码、口令等形式），用于传递更多信息，节省甄选时间，结果仅供参考，IT之家所有文章均包含本声明。 一年一度的 TGA 2024 颁奖典礼于今日举行，各大游戏奖项陆续揭晓，IT之家一文汇总。 #TGA##TGA2024#\\\"}\", \"metadata\": {\"title\": \"TGA 2024 完整获奖名单公布- 黑神话：悟空》最佳动作游戏\", \"url\": \"https://www.ithome.com/0/817/370.htm\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 年度游戏公布，谈谈今年我玩过的几款游戏\\\", \\\"url\\\": \\\"https://cn.technode.com/post/2024-12-13/tga-2024-review/\\\", \\\"content\\\": \\\"2 weeks ago - 最佳游戏指导 · 《宇宙机器人》 · 《小丑牌》 · 《黑神话：悟空》 · 《艾尔登法环 黄金树幽影》 · 《最终幻想 VII REBIRTH》 · 《暗喻幻想：ReFantazio》 · 最佳叙事 · 《暗喻幻想：ReFantazio》 · 《最终幻想 VII REBIRTH》 ·\\\"}\", \"metadata\": {\"title\": \"TGA 2024 年度游戏公布，谈谈今年我玩过的几款游戏\", \"url\": \"https://cn.technode.com/post/2024-12-13/tga-2024-review/\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA2024提名完整名单：来看看你心仪的游戏有无提名 ...\\\", \\\"url\\\": \\\"https://www.gamersky.com/news/202411/1846892.shtml\\\", \\\"content\\\": \\\"2024TGA提名名单已经全部揭晓，《黑神话：悟空》成功提名最佳艺术指导奖，最佳动作游戏奖，最佳游戏指导奖以及年度游戏奖，以下为各项奖项的完整提名名单。\\\"}\", \"metadata\": {\"title\": \"TGA2024提名完整名单：来看看你心仪的游戏有无提名 ...\", \"url\": \"https://www.gamersky.com/news/202411/1846892.shtml\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 完整获奖名单公布：《宇宙机器人》年度最佳游戏\\\", \\\"url\\\": \\\"https://news.qq.com/rain/a/20241213A049DS00\\\", \\\"content\\\": \\\"IT之家 12 月 13 日消息，一年一度的 TGA 2024 颁奖典礼于今日举行，各大游戏奖项陆续揭晓，IT之家汇总如下：最佳格斗游戏：《七龙珠电光炸裂! ZERO》《碧蓝幻想 Versus：崛起》《漫威 VS 卡普空格斗合集：街机经典》《多元宇宙大乱斗》《铁拳 8》（获奖）最佳 VR / AR 游戏：《蝙蝠侠：阿卡姆之影》（获奖）《地铁：觉醒》...\\\"}\", \"metadata\": {\"title\": \"TGA 2024 完整获奖名单公布：《宇宙机器人》年度最佳游戏\", \"url\": \"https://news.qq.com/rain/a/20241213A049DS00\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 年度游戏颁奖典礼专题\\\", \\\"url\\\": \\\"https://www.ithome.com/zt/tga2024/\\\", \\\"content\\\": \\\"TGA 2024 颁奖典礼于 12 月 12 日在美国洛杉矶孔雀剧院举办（北京时间 13 日上午 8:30），《宇宙机器人》获得年度最佳游戏，国产游戏《黑神话：悟空》获得最佳动作游戏。\\\"}\", \"metadata\": {\"title\": \"TGA 2024 年度游戏颁奖典礼专题\", \"url\": \"https://www.ithome.com/zt/tga2024/\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA2024年度最佳游戏入围名单一览 ...\\\", \\\"url\\\": \\\"https://www.gamersky.com/handbook/202411/1847434.shtml\\\", \\\"content\\\": \\\"TGA2024入围游戏名单已经公布，评选包含了多个奖项，那么最重要的年度最佳名单中都包含了哪些游戏呢？下面为大家带来TGA2024年度最佳游戏入围名单一览，一起来看看吧。\\\"}\", \"metadata\": {\"title\": \"TGA2024年度最佳游戏入围名单一览 ...\", \"url\": \"https://www.gamersky.com/handbook/202411/1847434.shtml\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 获奖&提名名单\\\", \\\"url\\\": \\\"https://indienova.com/indie-game-news/the-game-awards-2024-winners/\\\", \\\"content\\\": \\\"2024年12月13日 — 最佳游戏指导BEST GAME DIRECTION. Astro Bot 宇宙机器人. Balatro 小丑牌. Black Myth: Wukong 黑神话：悟空. Elden Ring: Shadow of the Erdtree 艾尔登 ...\\\"}\", \"metadata\": {\"title\": \"TGA 2024 获奖&提名名单\", \"url\": \"https://indienova.com/indie-game-news/the-game-awards-2024-winners/\"}}, {\"page_content\": \"{\\\"title\\\": \\\"《黑神话：悟空》入选，TGA 2024 年度最佳游戏提名...\\\", \\\"url\\\": \\\"https://www.ithome.com/0/811/488.htm\\\", \\\"content\\\": \\\"一年一度的 TGA 年度最佳游戏奖项今日公布了 2024 年的提名名单，国产 3A 大作《黑神话：悟空》提名 2024 年度最佳游戏。\\\"}\", \"metadata\": {\"title\": \"《黑神话：悟空》入选，TGA 2024 年度最佳游戏提名...\", \"url\": \"https://www.ithome.com/0/811/488.htm\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA2024落幕，年度最佳奖项大爆冷！《黑神话：悟空》陪跑\\\", \\\"url\\\": \\\"https://www.163.com/dy/article/JJ9U1DQP0526D9CJ.html\\\", \\\"content\\\": \\\"2024年12月13日 — TGA最具含金量的年度最佳游戏奖项，最终给到了索尼的《宇宙机器人》，出乎了所有人的意料。此前获得年度最佳游戏提名的作品中，《宇宙机器人》就因为 ...\\\"}\", \"metadata\": {\"title\": \"TGA2024落幕，年度最佳奖项大爆冷！《黑神话：悟空》陪跑\", \"url\": \"https://www.163.com/dy/article/JJ9U1DQP0526D9CJ.html\"}}, {\"page_content\": \"{\\\"title\\\": \\\"Tga2024获奖游戏一览表 Tga2024大奖是哪个游戏-游民 ...\\\", \\\"url\\\": \\\"https://www.gamersky.com/handbook/202412/1858999.shtml\\\", \\\"content\\\": \\\"TGA2024已经结束，在颁奖典礼中有很多的评选奖项，那么今年的大奖得主是哪款游戏呢？ 下面为大家带来TGA2024获奖游戏一览表，一起来看看吧。 首页 单机游戏 网络游戏 电视游戏 手机游戏\\\"}\", \"metadata\": {\"title\": \"Tga2024获奖游戏一览表 Tga2024大奖是哪个游戏-游民 ...\", \"url\": \"https://www.gamersky.com/handbook/202412/1858999.shtml\"}}, {\"page_content\": \"{\\\"title\\\": \\\"Tga 2024 完整获奖名单公布 - 篝火营地\\\", \\\"url\\\": \\\"https://gouhuo.qq.com/content/detail/0_20241212162319_tSwfPbkgZ\\\", \\\"content\\\": \\\"TGA 2024 颁奖典礼已经正式结束，各大奖项归属均已公布。《宇宙机器人》夺得年度游戏桂冠，《黑神话：悟空》收获最佳动作游戏及玩家之声奖。下面就是本届 TGA 的主要获奖名单。年度最佳游戏《宇宙机器人》 ...\\\"}\", \"metadata\": {\"title\": \"Tga 2024 完整获奖名单公布 - 篝火营地\", \"url\": \"https://gouhuo.qq.com/content/detail/0_20241212162319_tSwfPbkgZ\"}}, {\"page_content\": \"{\\\"title\\\": \\\"2024tga年度最佳游戏揭晓 Tga2024完整获奖名单一览 - 买购网\\\", \\\"url\\\": \\\"https://www.maigoo.com/news/726401.html\\\", \\\"content\\\": \\\"被誉为\\\\\\\"游戏界奥斯卡\\\\\\\"的TGA 2024（The Game Awards 2024）颁奖典礼在美国洛杉矶举办，Team ASOBI开发的《宇宙机器人》获得2024年度最佳游戏大奖! 中国游戏开发商\\\\\\\"游戏科学\\\\\\\"研发的角色扮演游戏《黑神话：悟空》获得\\\\\\\"最佳动作游戏\\\\\\\"、\\\\\\\"玩家之声\\\\\\\"奖项。\\\"}\", \"metadata\": {\"title\": \"2024tga年度最佳游戏揭晓 Tga2024完整获奖名单一览 - 买购网\", \"url\": \"https://www.maigoo.com/news/726401.html\"}}, {\"page_content\": \"{\\\"title\\\": \\\"Tga2024获奖名单公开，《宇宙机器人》获得年度最佳游戏 ...\\\", \\\"url\\\": \\\"https://www.msn.cn/zh-cn/gaming/%E5%8A%A8%E4%BD%9C%E5%86%92%E9%99%A9%E6%B8%B8%E6%88%8F/tga2024%E8%8E%B7%E5%A5%96%E5%90%8D%E5%8D%95%E5%85%AC%E5%BC%80-%E5%AE%87%E5%AE%99%E6%9C%BA%E5%99%A8%E4%BA%BA-%E8%8E%B7%E5%BE%97%E5%B9%B4%E5%BA%A6%E6%9C%80%E4%BD%B3%E6%B8%B8%E6%88%8F/ar-AA1vNLVS\\\", \\\"content\\\": \\\"【TGA2024】所有奖项现已公布，《宇宙机器人》获得年度最佳游戏，《黑神话悟空》仅获得年度最佳动作和玩家之声两个奖项，让我们来看一下今年tga的获奖名单。\\\"}\", \"metadata\": {\"title\": \"Tga2024获奖名单公开，《宇宙机器人》获得年度最佳游戏 ...\", \"url\": \"https://www.msn.cn/zh-cn/gaming/%E5%8A%A8%E4%BD%9C%E5%86%92%E9%99%A9%E6%B8%B8%E6%88%8F/tga2024%E8%8E%B7%E5%A5%96%E5%90%8D%E5%8D%95%E5%85%AC%E5%BC%80-%E5%AE%87%E5%AE%99%E6%9C%BA%E5%99%A8%E4%BA%BA-%E8%8E%B7%E5%BE%97%E5%B9%B4%E5%BA%A6%E6%9C%80%E4%BD%B3%E6%B8%B8%E6%88%8F/ar-AA1vNLVS\"}}, {\"page_content\": \"{\\\"title\\\": \\\"tga2024年度最佳游戏 - MSN\\\", \\\"url\\\": \\\"https://www.msn.cn/zh-cn/gaming/%E6%B8%B8%E6%88%8F%E5%B9%B3%E5%8F%B0/tga2024%E5%B9%B4%E5%BA%A6%E6%9C%80%E4%BD%B3%E6%B8%B8%E6%88%8F/ar-AA1vJ2IY\\\", \\\"content\\\": \\\"TGA将于太平洋时间12月12日（北京时间12月13日上午8:30）公布2024年度最佳游戏，颁奖典礼在美国洛杉矶孔雀剧院举行，届时将提供全程网络直播。\\\"}\", \"metadata\": {\"title\": \"tga2024年度最佳游戏 - MSN\", \"url\": \"https://www.msn.cn/zh-cn/gaming/%E6%B8%B8%E6%88%8F%E5%B9%B3%E5%8F%B0/tga2024%E5%B9%B4%E5%BA%A6%E6%9C%80%E4%BD%B3%E6%B8%B8%E6%88%8F/ar-AA1vJ2IY\"}}, {\"page_content\": \"{\\\"title\\\": \\\"Tga2024：《宇宙机器人》获年度最佳游戏!《黑神话 ...\\\", \\\"url\\\": \\\"https://www.gamersky.com/news/202412/1858641.shtml\\\", \\\"content\\\": \\\"最佳动作游戏——《黑神话：悟空》 最佳表演奖——Melina Juergens《地狱之刃2：塞娜的史诗》 最佳家庭游戏——《 宇宙机器人 》\\\"}\", \"metadata\": {\"title\": \"Tga2024：《宇宙机器人》获年度最佳游戏!《黑神话 ...\", \"url\": \"https://www.gamersky.com/news/202412/1858641.shtml\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024获奖游戏名单汇总:《黑神话:悟空》最佳动作 ...\\\", \\\"url\\\": \\\"https://www.dealmoon.com/guide/1004172\\\", \\\"content\\\": \\\"2024年12月12日 — 一年一度的游戏界奥斯卡——2024 TGA（The Game Awards）获奖游戏名单汇总来啦！省流总结：《黑神话：悟空》虽遗憾未获年度最佳，但拿下最佳动作游戏+ ...\\\"}\", \"metadata\": {\"title\": \"TGA 2024获奖游戏名单汇总:《黑神话:悟空》最佳动作 ...\", \"url\": \"https://www.dealmoon.com/guide/1004172\"}}, {\"page_content\": \"{\\\"title\\\": \\\"游民星空TGA2024游戏大奖专题|选出你的年度游戏\\\", \\\"url\\\": \\\"https://www.gamersky.com/zhuanti/tga2024/\\\", \\\"content\\\": \\\"《命运方舟》 玩这么“大” · 《永劫无间》又卖了100万份？\\\"}\", \"metadata\": {\"title\": \"游民星空TGA2024游戏大奖专题|选出你的年度游戏\", \"url\": \"https://www.gamersky.com/zhuanti/tga2024/\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2024 年度游戏颁奖典礼专题\\\", \\\"url\\\": \\\"https://m.ithome.com/zt/tga2024\\\", \\\"content\\\": \\\"TGA 2024 年度游戏各奖项提名候选名单于北京时间 11 月 19 日凌晨 1 点正式公开，今年的 TGA 颁奖典礼于 12 月 12 日在美国洛杉矶孔雀剧院举办（北京时间 13 日上午 8:30）。\\\"}\", \"metadata\": {\"title\": \"TGA 2024 年度游戏颁奖典礼专题\", \"url\": \"https://m.ithome.com/zt/tga2024\"}}, {\"page_content\": \"{\\\"title\\\": \\\"《黑神话：悟空》获年度最佳提名：2024年TGA大奖提名公布\\\", \\\"url\\\": \\\"https://www.gcores.com/articles/191064\\\", \\\"content\\\": \\\"最佳游戏指导 · 《宇宙机器人》 · 《小丑牌》 · 《黑神话悟空》 · 《艾尔登法环黄金树幽影》 · 《最终幻想VII 重生》 · 《暗喻幻想：ReFantazio》 ...\\\"}\", \"metadata\": {\"title\": \"《黑神话：悟空》获年度最佳提名：2024年TGA大奖提名公布\", \"url\": \"https://www.gcores.com/articles/191064\"}}, {\"page_content\": \"{\\\"title\\\": \\\"TGA 2023 完整获奖名单：《博德之门 3》年度最佳游...\\\", \\\"url\\\": \\\"https://www.ithome.com/0/737/889.htm\\\", \\\"content\\\": \\\"#tga# #tga2023# 今日的 TGA 2023 颁奖典礼可谓惊喜不断，国产 3A 大作《黑神话：悟空》官宣明年 8 月 20 日发售，小岛秀夫带来和微软合作游戏《OD》，还有一系列游戏奖项公布。\\\"}\", \"metadata\": {\"title\": \"TGA 2023 完整获奖名单：《博德之门 3》年度最佳游...\", \"url\": \"https://www.ithome.com/0/737/889.htm\"}}]",
  "config": "{\"activeEngines\": [], \"rerank\": true, \"rerankThreshold\": 0, \"searchWeb\": true, \"summarizer\": true}"
}

if __name__ == "__main__":
    res = main(**input_params)
    pass