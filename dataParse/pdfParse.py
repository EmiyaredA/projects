import json
from pdfminer.high_level import extract_text

def extract_and_save_as_json(file_path, output_path):
    text = extract_text(file_path)
    data = {
        "file": file_path,
        "content": text
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

file_path = r"C:\home\tonghao\paper\2212.09297.pdf"
output_path = "output.json"
extract_and_save_as_json(file_path, output_path)
print(f"Saved JSON to {output_path}")
