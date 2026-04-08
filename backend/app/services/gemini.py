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

def parse_extrato(file_content: bytes, mime_type: str, doc_type: str = "extrato") -> str:
    if doc_type == "fatura":
        prompt = """Analise esta fatura de cartão de crédito e extraia TODAS as compras/lançamentos individuais.
Retorne APENAS um JSON válido no formato:
[{"date": "YYYY-MM-DD", "description": "nome do estabelecimento ou descrição", "amount": -45.00}]
REGRAS OBRIGATÓRIAS:
- Todos os valores devem ser NEGATIVOS (são gastos com cartão)
- NÃO inclua: pagamento da fatura, pagamento mínimo, encargos, juros, multas, saldo anterior, total da fatura
- Inclua APENAS as compras e serviços cobrados
- Se a data não aparecer, use o primeiro dia do mês da fatura
- Se a descrição for muito longa, resuma em até 40 caracteres
Não inclua nenhum texto além do JSON."""
    elif doc_type == "pix_only":
        prompt = """Analise este extrato bancário e extraia SOMENTE as transações Pix de SAÍDA (pagamentos feitos via Pix).
Retorne APENAS um JSON válido no formato:
[{"date": "YYYY-MM-DD", "description": "Pix - nome ou descrição", "amount": -45.00}]
REGRAS OBRIGATÓRIAS:
- Inclua APENAS transferências Pix enviadas/pagas (saídas)
- NÃO inclua: Pix recebidos, TED, DOC, boletos, compras no débito, tarifas, saques, salário
- Todos os valores devem ser NEGATIVOS
- Prefixe a descrição com "Pix - " se ainda não tiver
- Se a descrição for muito longa, resuma em até 40 caracteres
Se não houver nenhum Pix de saída, retorne [].
Não inclua nenhum texto além do JSON."""
    else:
        prompt = """Analise este extrato bancário e extraia TODAS as transações individuais.
Retorne APENAS um JSON válido no formato:
[{"date": "YYYY-MM-DD", "description": "descrição", "amount": -45.00}]
REGRAS OBRIGATÓRIAS:
- Valores NEGATIVOS = saídas, débitos, compras, pagamentos
- Valores POSITIVOS = entradas, créditos, transferências recebidas, salário, Pix recebido
- NÃO inclua: saldo, totais, linhas de resumo ou cabeçalhos
- Inclua APENAS transações individuais
- Se a descrição for muito longa, resuma em até 40 caracteres
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
