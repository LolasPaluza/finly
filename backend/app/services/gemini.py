import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# gemini-2.0-flash: 1500 req/day free tier (vs 20/day for 2.5-flash)
model = genai.GenerativeModel("gemini-2.5-flash-lite")

def call_gemini(prompt: str, file_content: bytes = None, mime_type: str = None) -> str:
    parts = [prompt]
    if file_content:
        parts = [{"mime_type": mime_type, "data": file_content}, prompt]
    response = model.generate_content(parts)
    return response.text

def parse_extrato(file_content: bytes, mime_type: str) -> str:
    prompt = """Analise este extrato bancário e extraia TODAS as transações.
Retorne APENAS um JSON válido no formato:
[{"date": "YYYY-MM-DD", "description": "descrição", "amount": -45.00}]
Valores negativos = despesas, positivos = receitas/entradas.
Não inclua nenhum texto além do JSON."""
    return call_gemini(prompt, file_content, mime_type)

def categorize_transactions(transactions: list[dict]) -> list[dict]:
    prompt = f"""Categorize cada transação com uma dessas categorias:
Alimentação, Moradia, Transporte, Lazer, Saúde, Educação, Assinaturas, Receita, Outros

Transações:
{transactions}

Retorne APENAS o mesmo JSON com o campo "category" adicionado a cada item.
Não inclua nenhum texto além do JSON."""
    return call_gemini(prompt)

def chat_with_context(user_message: str, transactions: list[dict]) -> str:
    prompt = f"""Você é um assistente financeiro pessoal chamado Finly.
Responda em português, de forma direta e útil.
Baseie sua resposta nos dados financeiros do usuário abaixo.

DADOS DO USUÁRIO:
{transactions}

PERGUNTA: {user_message}"""
    return call_gemini(prompt)

def generate_suggestions(transactions: list[dict], available: float) -> str:
    prompt = f"""Baseado nos dados financeiros abaixo, gere 3 sugestões específicas e práticas
para economizar ou investir. Seja direto e mencione valores reais.
Retorne APENAS uma lista JSON de strings. Ex: ["Sugestão 1", "Sugestão 2", "Sugestão 3"]

DADOS: {transactions}
VALOR DISPONÍVEL: R$ {available:.2f}"""
    return call_gemini(prompt)
