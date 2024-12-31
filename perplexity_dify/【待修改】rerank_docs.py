import os
import json
from typing import List, Dict
import requests
import math
from datetime import datetime

class Document:
    def __init__(self, page_content: str, metadata: dict):
        self.page_content = page_content
        self.metadata = metadata

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

def embed_documents(documents: List[Document], model="text-embedding-ada-002") -> List[Dict]:
    embeddings = []

    for doc in documents:
        # 使用 Document 对象的 page_content 获取嵌入向量
        embedding = get_embedding(doc.page_content, model)

        if embedding:  # 如果嵌入向量获取成功
            embeddings.append({
                "embedding": embedding,
                "metadata": doc.metadata  # 保留文档的 metadata
            })
        else:
            print(f"Failed to get embedding for document: {doc.page_content}")

    return embeddings

def get_embedding(text, model="text-embedding-ada-002"):
    api_url = "https://platform.llmprovider.ai/v1/embeddings"
    api_key = "sk-Y7WuSEuYIchtepzPxcvIHxby7jkRHMxhDfWwSu4PE68eD70eC2C249Ae82221969B26a47Bb"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    # 请求数据体
    data = {
        "model": model,
        "input": text
    }

    try:
        # 发送POST请求
        response = requests.post(api_url, headers=headers, json=data)
        response.raise_for_status()  # 检查请求是否成功

        # 解析响应
        embedding = response.json().get('data')[0].get('embedding')
        return embedding

    except requests.exceptions.RequestException as e:
        print(f"Error occurred: {e}")
        return None

def process_docs(docs):
    return "\n".join([f"{index + 1}. {docs[index].page_content}" for index in range(len(docs))])

def get_current_utc_datetime():
    # 获取当前时间（UTC时区）
    current_datetime = datetime.utcnow()
    # 将其格式化为ISO 8601格式
    return current_datetime.isoformat() + 'Z'  # 'Z'表示UTC时间

class RerankDocs:
    def __init__(self, config):
        self.config = config

    def rerank_docs(
        self,
        query: str,
        docs: List[Document],
        # file_ids: List[str],
        optimization_mode: str
    ) -> List[Document]:
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

        if query.lower() == 'summarize':
            return docs[:15]

        docs_with_content = [doc for doc in docs if doc.page_content and len(doc.page_content) > 0]

        # Step 2: 根据优化模式进行重排序
        if optimization_mode == 'speed' or self.config.get('rerank', False) is False:
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

        elif optimization_mode == 'balanced':
            # 获取文档的嵌入向量
            doc_embeddings = embed_documents([doc.page_content for doc in docs_with_content])
            query_embedding = get_embedding(query)

            # 合并文件数据
            # docs_with_content.extend([
            #     Document(page_content=file_data['content'], metadata={'title': file_data['fileName'], 'url': 'File'})
            #     for file_data in files_data
            # ])
            # doc_embeddings.extend([file_data['embeddings'] for file_data in files_data])

            # 计算相似度
            similarity = [
                {'index': i, 'similarity': compute_similarity(query_embedding, doc_embedding["embedding"])}
                for i, doc_embedding in enumerate(doc_embeddings)
            ]

            # 排序并返回前 15 个文档
            sorted_docs = sorted(
                [sim for sim in similarity if sim['similarity'] > (self.config.get('rerankThreshold', 0.3))],
                key=lambda x: x['similarity'],
                reverse=True
            )[:15]

            return [docs_with_content[sim['index']] for sim in sorted_docs]

        return docs

def main(query: str, docs: list, config: str, search_type: str):
    docs = [json.loads(doc_dict) for doc_dict in docs]
    config = json.loads(config)
    config = config[search_type]
    rerankDocs = RerankDocs(config)
    res_docs = rerankDocs.rerank_docs(
        query=query,
        docs=docs,
        optimization_mode='balanced'
    )

    return {
        "docs_list_str": str(res_docs),
        "docs_str": process_docs(docs),
        "date": get_current_utc_datetime()
    }