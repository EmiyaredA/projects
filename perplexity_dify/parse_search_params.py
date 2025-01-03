import json
from jinja2 import Template

def formatChatHistoryAsString(all_history):
    type_map = {
        "user": "human",
        "assistant": "ai"
    }
    history_formatted = "\n".join([
        f"{dialog['role']}: {dialog['content']}" for dialog in all_history
    ])


def main(user_input: str, all_history: str, search_type: str):
    search_handlers = {
        'webSearch': {
            'activeEngines': [],
            'rerank': True,
            'rerankThreshold': 0,
            'searchWeb': True,
            'summarizer': True,
        },
        'academicSearch': {
            'activeEngines': [],
            'rerank': True,
            'rerankThreshold': 0,
            'searchWeb': True,
            'summarizer': False,
        },
        'writingAssistant': {
            'activeEngines': [],
            'rerank': True,
            'rerankThreshold': 0,
            'searchWeb': False,
            'summarizer': False,
        },
        'scienceSearch': {
            'activeEngines': [],
            'rerank': False,
            'rerankThreshold': 0,
            'searchWeb': True,
            'summarizer': False,
        },
        'videoSearch': {
            'activeEngines': [],
            'rerank': True,
            'rerankThreshold': 0,
            'searchWeb': True,
            'summarizer': False,
        },
        'socialSearch': {
            'activeEngines': [],
            'rerank': True,
            'rerankThreshold': 0,
            'searchWeb': True,
            'summarizer': False,
        }
    }

    search_retriever_prompt = {
        'webSearch': Template("""
You are an AI question rephraser. You will be given a conversation and a follow-up question,  you will have to rephrase the follow up question so it is a standalone question and can be used by another LLM to search the web for information to answer it.

Example:
1. Follow up question: What is the capital of France
Rephrased question: Capital of france

2. Follow up question: What is Docker?
Rephrased question: What is Docker

3. Follow up question: How does stable diffusion work?
Rephrased: Stable diffusion working

Conversation:
{{chat_history}}

Follow up question: {{query}}
Rephrased question:""".strip()),
        'academicSearch': Template("""You will be given a conversation below and a follow up question. You need to rephrase the follow-up question if needed so it is a standalone question that can be used by the LLM to search the web for information.

Example:
1. Follow up question: How does stable diffusion work?
Rephrased: Stable diffusion working

2. Follow up question: What is linear algebra?
Rephrased: Linear algebra

3. Follow up question: What is the third law of thermodynamics?
Rephrased: Third law of thermodynamics

Conversation:
{{chat_history}}

Follow up question: {{query}}
Rephrased question:""".strip()),
        'scienceSearch': Template("""
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question if needed so it is a standalone question that can be used by the LLM to search the web for information.

Example: 
1. Follow up question: What is the atomic radius of S? 
Rephrased: Atomic radius of S 

2. Follow up question: What is linear algebra?
Rephrased: Linear algebra

3. Follow up question: What is the third law of thermodynamics? 
Rephrased: Third law of thermodynamics

Conversations:
{{all_history}}

Follow up question: {{search_query}}
Rephrased question:""".strip()),
        'videoSearch': Template("""
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question if needed so it is a standalone question that can be used by the LLM to search the web for information.

Example: 
1. Follow up question: How does an A.C work? 
Rephrased: A.C working 

2. Follow up question: Any cool new AI breakthroughs?
Rephrased: New AI breakthroughs

3. Follow up question: What is theory of relativity? 
Rephrased: What is theory of relativity? 

Conversations:
{{all_history}}

Follow up question:{{search_query}} 
Rephrased question:""".strip()),
        'socialSearch': Template("""
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question if needed so it is a standalone question that can be used by the LLM to search the web for information.

Example: 
1. Follow up question: Which company is most likely to create an AGI 
Rephrased: Which company is most likely to create an AGI 

2. Follow up question: Is Earth flat?
Rephrased: Is Earth flat?

3. Follow up question: Is there life on Mars? 
Rephrased: Is there life on Mars? 

Conversations:
{{all_history}}

Follow up question: {{search_query}}
Rephrased question:""".strip())
    }

    search_query = user_input

    try:
        all_history_list = json.loads(all_history)
    except:
        all_history_list = []
    all_history_list.append({"role": "user", "content": search_query})
    history_with_searchQuery = formatChatHistoryAsString(all_history_list)

    return {
        "search_query": search_query,
        "search_config": json.dumps(search_handlers[search_type], ensure_ascii=False),
        "search_retriever_prompt": search_retriever_prompt[search_type].render(all_history=all_history,query=search_query),
        "history_with_searchQuery": json.dumps(history_with_searchQuery, ensure_ascii=False)
    }
