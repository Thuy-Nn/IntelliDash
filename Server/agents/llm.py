import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

_llm = None
def get_llm_client():

    global _llm
    if _llm is None:
        _llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _llm

if __name__ == "__main__":
    #Test LLM client
    llm_client = get_llm_client()
    res = llm_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, how can you assist me today?"}
        ]
    )
    print(res.choices[0].message.content)