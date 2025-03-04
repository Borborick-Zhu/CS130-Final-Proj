import uuid
import io
from fastapi import HTTPException
from dotenv import load_dotenv
import os

# Llama and OpenAI imports
from llama_parse import LlamaParse
from llama_index.llms.openai import OpenAI as LlamaOpenAI  
from llama_index.core.node_parser import MarkdownElementNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
import asyncio
import tiktoken
import re
import nest_asyncio
import openai
load_dotenv()

nest_asyncio.apply()



def chunking_instructions(text):
    return (
    "Split the markdown text into semantically coherent sections. These sections should have a clear start and end, "
    "focusing on a single topic. These chunks MUST contain all of the text related to the topic and can span multiple lines. "
    "Each chunk needs to include some meaninful content and should NEVER just be a section header."
    "When the topic changes, the chunk changes as well.\n\n"
    
    "Footnotes or a footer should not be misinterpreted as a topic change. Do not use them to justify a chunk change.\n\n"
    
    "A corresponding question/answer pair should be included in the same chunk. Different question/answer pairs "
    "should be chunked separately, as they are semantically different.\n\n"
    
    'Create these "chunks" by adding "<CHUNK_BREAK>" (no spaces) into the text as a chunk delimiter. Do not change anything else in the provided text. '
    "Do not remove the <page_number> delimiter.\n\n"
    
    "If you see a new line in text, keep the \\n character. Do not change a single character of the provided text.\n\n"
    
    f"Provided text: {text}"
   )

def create_flashcard_instructions(chunk):
    # Instruct the model to generate a flashcard with a question and an answer
    return (
        "Based on the following text chunk, create a flashcard with a question and answer. "
        "The flashcard should capture the main ideas of the text. "
        "Format your response exactly as follows, without any additional commentary:\n\n"
        "Question: <Your question here>\n"
        "Answer: <Your answer here>\n\n"
        f"Text chunk: {chunk}"
    )

async def create_flashcard(client, chunk, index):
    try:
        context = [
            {"role": "user", "content": create_flashcard_instructions(chunk)}
        ]
        completion = await client.chat.completions.create(
            model="gpt-4o",
            messages=context
        )
        response = completion.choices[0].message.content

        # Split the response into question and answer using regex
        question_match = re.search(r'Question:\s*(.*?)\nAnswer:', response, re.DOTALL)
        answer_match = re.search(r'Answer:\s*(.*)', response, re.DOTALL)
        
        if question_match and answer_match:
            question = question_match.group(1).strip()
            answer = answer_match.group(1).strip()
        else:
            raise ValueError("Flashcard response not in expected format. Expected 'Question:' and 'Answer:' markers.")

        # Return the original index along with the flashcard (question, answer)
        return (question, answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chunking page {index} failed: {str(e)}")



async def process_chunks(client, chunks):
    """
    Processes all chunks in parallel, generating a QA flashcard for each
    """
    tasks = [create_flashcard(client, chunk, i) for i, chunk in enumerate(chunks)]
    qa_pairs = await asyncio.gather(*tasks)

    return qa_pairs

def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """ Helper function to count tokens """
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))


async def chunk_text(client, block_text, index):
    """
    Sends a request to OpenAI to chunk a block of text and returns the result with its index.
    """
    try:
        context = [
            {"role": "user", "content": chunking_instructions(block_text)}
        ]
        
        completion = await client.chat.completions.create(
            model="gpt-4o",
            messages=context
        )
        print(f"Page {index} completed")
        return index, completion.choices[0].message.content.split("<CHUNK_BREAK>")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chunking page {index} failed: {str(e)}")


async def process_blocks(client, blocks):
    """
    run chunking requests concurrently
    """
    tasks = [chunk_text(client, block, i) for i, block in enumerate(blocks)]
    chunked_results = await asyncio.gather(*tasks)

    chunked_results.sort(key=lambda x: x[0])

    document_chunks = [chunk for _, sublist in chunked_results for chunk in sublist]

    return document_chunks


def filter_markdown_chunks(chunks):
    """
    Filters out markdown chunks that contain only headers and empty lines.
    """
    approved_chunks = []
    flagged_chunks = []
    
    header_pattern = re.compile(r'^(#{1,6}\s+[^\n]+)$', re.MULTILINE)
    # Detects any non-header, non-whitespace content
    non_empty_pattern = re.compile(r'[^#\s]')  
    
    for chunk in chunks:
        headers = header_pattern.findall(chunk.strip())
        contains_non_header_content = bool(non_empty_pattern.search(chunk))
        
        if contains_non_header_content:
            approved_chunks.append(chunk)
        else:
            flagged_chunks.append(chunk)
    
    return approved_chunks, flagged_chunks



async def process_file(file_content: bytes) -> list:
    """
    Process the file and return a list of document sections with embeddings.
    """
    try:
        parser = LlamaParse(
            api_key= os.getenv("LLAMA_CLOUD_API_KEY"),
            result_type="markdown"
        )
        documents = await parser.aload_data(file_path=io.BytesIO(file_content), extra_info={"file_name": "uploaded file"})
    except Exception as e:
        print("Parser init failed:", str(e))
        raise HTTPException(status_code=500, detail=f"Parser init failed: {str(e)}")
    
    print("Processing file...")
    max_tokens_to_split = 1000
    # must be at least the size of the largest page
    # max_tokens_to_split = max(
    #     max_tokens_to_split,
    #     max(count_tokens(doc.text) for doc in documents) + 1
    # )

    # group pages into large blocks that will be chunked
    blocks = []
    pending_text = ""
    page_num = 0

    while page_num < len(documents):
        page_tokens = count_tokens(documents[page_num].text)
        
        if count_tokens(pending_text) + page_tokens <= max_tokens_to_split:
            pending_text += documents[page_num].text
            page_num += 1
        else:
            if pending_text:  
                blocks.append(pending_text)
            pending_text = ""
    if pending_text:
        blocks.append(pending_text)

    # init client
    openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        # semantically split chunks from blocks
        document_chunks = await process_blocks(openai_client,blocks)

        # remove empty chunks or chunks that only have headers in them w no content
        approved_chunks, flagged_chunks = filter_markdown_chunks(document_chunks)
        
        # generate flashcards
        qa_pairs = await process_chunks(openai_client, approved_chunks)

        return qa_pairs
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic splitting failed: {str(e)}")


