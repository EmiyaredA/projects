import json
import requests

def get_embedding(text, base_url, api_key, model="text-embedding-ada-002"):
    api_url = f"{base_url}/embeddings"
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

def main(query:str, base_url:str, api_key:str):
    # 最多重试3次
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # 调用get_embedding函数
            embedding = get_embedding(query, base_url, api_key)
            # 如果成功获取嵌入，返回结果
            if embedding is not None:
                return {"query_embedding": json.dumps(embedding, ensure_ascii=False)}
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")

if __name__ == "__main__":
    res = main(
        query="测试一下embedding",
        base_url="https://platform.llmprovider.ai/v1",
        api_key="sk-Y7WuSEuYIchtepzPxcvIHxby7jkRHMxhDfWwSu4PE68eD70eC2C249Ae82221969B26a47Bb"
    )
    print(res)