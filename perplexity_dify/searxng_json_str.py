import json
def main(searxng_json: list) -> dict:
    return {
        "searxng_json_str": json.dumps(searxng_json[:5], ensure_ascii=False),
    }
