import json
def main(searxng_json: list) -> dict:
    return {
        "searxng_json_str": json.dumps(searxng_json[:20], ensure_ascii=False),
    }
