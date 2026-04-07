import json
import re
from app.services.gemini import parse_extrato, categorize_transactions

def extract_json(text: str) -> list:
    """Extrai JSON de uma resposta de texto do Gemini."""
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if not match:
        raise ValueError(f"Gemini não retornou JSON válido: {text[:200]}")
    return json.loads(match.group())

def parse_and_categorize(file_content: bytes, mime_type: str, month: str) -> list[dict]:
    raw = parse_extrato(file_content, mime_type)
    transactions = extract_json(raw)

    for t in transactions:
        t["month"] = month

    categorized_raw = categorize_transactions(transactions)
    categorized = extract_json(categorized_raw)
    return categorized
