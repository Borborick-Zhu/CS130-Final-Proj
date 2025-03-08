import asyncio
import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Import everything from your file_service.py
# Adjust the import path if needed
from file_service import (
    chunking_instructions,
    create_flashcard_instructions,
    create_flashcard,
    process_chunks,
    count_tokens,
    chunk_text,
    process_blocks,
    filter_markdown_chunks,
    process_file
)


#Helper for the functions that need the openai client
def get_openai_async_client():
    """
    Returns the same openai.AsyncOpenAI instance that your process_file()
    function uses, so we can pass it to chunk_text, create_flashcard, etc.
    """
    return openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


#test runner functions
def run_test(test_func):
    """Runs a single synchronous test function and prints result."""
    try:
        test_func()
        print(f"{test_func.__name__}: PASSED")
    except AssertionError as e:
        print(f"{test_func.__name__}: FAILED (AssertionError) -> {e}")
    except Exception as e:
        print(f"{test_func.__name__}: FAILED (Exception) -> {e}")

async def run_async_test(test_func):
    """Runs a single asynchronous test function and prints result."""
    try:
        await test_func()
        print(f"{test_func.__name__}: PASSED")
    except AssertionError as e:
        print(f"{test_func.__name__}: FAILED (AssertionError) -> {e}")
    except Exception as e:
        print(f"{test_func.__name__}: FAILED (Exception) -> {e}")


#test functions
def test_chunking_instructions_basic():
    example_text = "This is a small text to chunk."
    result = chunking_instructions(example_text)
    assert "Split the markdown text into semantically coherent sections" in result
    assert example_text in result

def test_create_flashcard_instructions_basic():
    chunk = "Photosynthesis explanation..."
    result = create_flashcard_instructions(chunk)
    assert "Based on the following text chunk" in result
    assert "Question:" in result and "Answer:" in result
    assert chunk in result

def test_count_tokens_basic():
    text = "Hello world!"
    num_tokens = count_tokens(text)
    assert num_tokens > 0, "count_tokens should return a positive integer"


#async tests that call the api

async def test_create_flashcard_real_call():
    """
    Uses the same style of client as process_file() does.
    This will cost tokens since it calls GPT for real.
    """
    openai_client = get_openai_async_client()
    chunk = "Python is a programming language used for web development and data science."
    
    question, answer = await create_flashcard(openai_client, chunk, 0)
    print("QUESTION:", question)
    print("ANSWER:", answer)
    assert len(question) > 5, "Question should have some length"
    assert len(answer) > 5, "Answer should have some length"


async def test_process_blocks_real_call():
    openai_client = get_openai_async_client()
    blocks = [
        "Block1 content about cats. Another line.\n",
        "Block2 content about dogs. Another line.\n"
    ]
    chunked_output = await process_blocks(openai_client, blocks)
    print("BLOCKS CHUNKED OUTPUT:", chunked_output)
    assert len(chunked_output) >= 2, "We expect at least some chunking from each block."

async def test_process_chunks_real_call():
    openai_client = get_openai_async_client()
    chunks = [
        "Python is an interpreted language.",
        "FastAPI is a modern web framework in Python."
    ]
    qa_pairs = await process_chunks(openai_client, chunks)
    print("QA PAIRS:", qa_pairs)
    assert len(qa_pairs) == len(chunks), "We should get a flashcard for each chunk."
    for q, a in qa_pairs:
        assert len(q) > 5 and len(a) > 5, "Each question/answer should have content."

async def test_process_file_real_call():
    """
    This function already does openai.AsyncOpenAI(...) internally, 
    so we just call it, no need for the client helper.
    """
    fake_pdf_content = b"Introduction: This is a test PDF.\n\nPage2: Some more text."
    qa_pairs = await process_file(fake_pdf_content)
    print("FILE QA PAIRS:", qa_pairs)
    assert len(qa_pairs) > 0, "We expect at least one Q/A pair from the processed file."

#main func
async def main():
    # Synchronous tests
    run_test(test_chunking_instructions_basic)
    run_test(test_create_flashcard_instructions_basic)
    run_test(test_count_tokens_basic)
    #run_test(test_filter_markdown_chunks_basic)

    # Asynchronous (real GPT) tests
    await run_async_test(test_create_flashcard_real_call)
    #await run_async_test(test_chunk_text_real_call)
    await run_async_test(test_process_blocks_real_call)
    await run_async_test(test_process_chunks_real_call)
    await run_async_test(test_process_file_real_call)

if __name__ == "__main__":
    asyncio.run(main())
