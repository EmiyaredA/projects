import json

class Document:
    def __init__(self, page_content: str, metadata: dict):
        self.page_content = page_content
        self.metadata = metadata

    # 返回类的字典
    def to_dict(self):
        return {
            "page_content": self.page_content,
            "metadata": self.metadata,
        }


def parse_articles(content):
    if '\n' not in content.strip():
        return []
    # Split content into individual articles based on double newline
    articles = content.split('\n\n')

    parsed_articles = []

    for article in articles:
        lines = article.split('\n')

        # Extract fields line by line
        published = lines[0].replace('Published: ', '').strip()
        title = lines[1].replace('Title: ', '').strip()
        authors = [author.strip() for author in lines[2].replace('Authors: ', '').strip().split(',')]
        summary = ' '.join(line.strip() for line in lines[3:]).replace('Summary: ', '').strip()

        # Append parsed article as a dictionary
        parsed_articles.append({
            "Published": published,
            "Title": title,
            "Authors": authors,
            "Summary": summary
        })

    return parsed_articles

def main(searxng_json_str: str, search_type: str):
    if search_type == 'academicSearch':
        parsed_articles = parse_articles(searxng_json_str)
        documents = [
            Document(
                page_content=json.dumps(article, ensure_ascii=False),  # 这应该是 res.content
                metadata=article
            ).to_dict()
            for article in parsed_articles
        ]
        documents = documents[:5]
    else:
        searxng_json = json.loads(searxng_json_str)
        documents = [
            Document(
                page_content=json.dumps({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result["content"]
                }, ensure_ascii=False),  # 这应该是 res.content
                metadata={
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    **({"img_src": result["img_src"]} if result.get("img_src") else {}),
                }
            ).to_dict()
            for result in searxng_json
        ]

    return {
        "docs": json.dumps(documents, ensure_ascii=False)
    }