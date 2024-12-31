import json
import math

def compute_similarity(x: list, y: list, similarity_measure: str = 'cosine') -> float:
    """
    Compute the similarity between two vectors based on the chosen similarity measure.

    Parameters:
    - x (list): First vector.
    - y (list): Second vector.
    - similarity_measure (str): Similarity measure, either 'cosine' or 'dot'.

    Returns:
    - float: Similarity score.
    """
    if similarity_measure == 'cosine':
        return cosine_similarity(x, y)
    elif similarity_measure == 'dot':
        return dot_product(x, y)
    else:
        raise ValueError('Invalid similarity measure')

def cosine_similarity(x: list, y: list) -> float:
    """
    Compute the cosine similarity between two vectors.

    Parameters:
    - x (list): First vector.
    - y (list): Second vector.

    Returns:
    - float: Cosine similarity score.
    """
    dot_product_value = dot_product(x, y)
    norm_x = math.sqrt(sum(xi**2 for xi in x))
    norm_y = math.sqrt(sum(yi**2 for yi in y))
    return dot_product_value / (norm_x * norm_y) if norm_x != 0 and norm_y != 0 else 0.0

def dot_product(x: list, y: list) -> float:
    """
    Compute the dot product of two vectors.

    Parameters:
    - x (list): First vector.
    - y (list): Second vector.

    Returns:
    - float: Dot product value.
    """
    return sum(xi * yi for xi, yi in zip(x, y))

class RerankDocs:
    def __init__(self, config):
        self.config = config

    def rerank_docs(
        self,
        query_embedding: list,
        docs: list,
        sorted_doc_embeddings: list,
        # file_ids: List[str]
    ) -> list:
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

        # 获取文档的嵌入向量

        # 合并文件数据
        # docs_with_content.extend([
        #     Document(page_content=file_data['content'], metadata={'title': file_data['fileName'], 'url': 'File'})
        #     for file_data in files_data
        # ])
        # doc_embeddings.extend([file_data['embeddings'] for file_data in files_data])

        # 计算相似度
        similarity = [
            {'index': i, 'similarity': compute_similarity(query_embedding, doc_embedding)}
            for i, doc_embedding in enumerate(sorted_doc_embeddings)
        ]

        # 排序并返回前 15 个文档
        sorted_docs = sorted(
            [sim for sim in similarity if sim['similarity'] > (self.config.get('rerankThreshold', 0.3))],
            key=lambda x: x['similarity'],
            reverse=True
        )[:15]

        return [docs_with_content[sim['index']] for sim in sorted_docs]

def main(query_embedding_str: str, doc_embeddings: list, docs: str, config: str):
    config = json.loads(config)
    rerankDocs = RerankDocs(config)
    sorted_doc_embeddings = [
        value
        for _, value in sorted(
            (list(json.loads(d).items())[0] for d in doc_embeddings), key=lambda x: x[0]
        )
    ]
    res_docs = rerankDocs.rerank_docs(
        query_embedding=json.loads(query_embedding_str),
        sorted_doc_embeddings=sorted_doc_embeddings,
        docs=json.loads(docs)
    )

    return {
        "rerank_docs_str": json.dumps(res_docs, ensure_ascii=False)
    }