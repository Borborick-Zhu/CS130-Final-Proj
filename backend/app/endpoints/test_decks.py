import asyncio
from types import SimpleNamespace
from fastapi import HTTPException, status
from decks import DeckCreate, DeckUpdate, FlashcardCreate
from decks import (
    create_deck,
    get_user_decks,
    delete_deck,
    update_deck,
    get_deck_flashcards,
    create_flashcards,
)
# Note: in order to prevent the supabase client from connecting, comment out these 2 lines 
# in decks.py to allow testing:
"""
#from app.services.file_service import process_file
#supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
"""

class FakeTable:
    def __init__(self, table_name: str, response: dict):
        self.table_name = table_name
        self.response = response
        self.called_methods = []

    def insert(self, data):
        self.called_methods.append(("insert", data))
        self.insert_data = data
        return self

    def select(self, columns="*"):
        self.called_methods.append(("select", columns))
        return self

    def update(self, data):
        self.called_methods.append(("update", data))
        self.update_data = data
        return self

    def delete(self):
        self.called_methods.append(("delete", None))
        return self

    def eq(self, key, value):
        self.called_methods.append(("eq", (key, value)))
        self.eq_data = (key, value)
        return self

    def match(self, conditions):
        self.called_methods.append(("match", conditions))
        self.match_data = conditions
        return self

    def execute(self):
        self.called_methods.append(("execute", None))
        # wrap the response dict in a SimpleNamespace so that `data` is accessible as an attribute
        return SimpleNamespace(data=self.response.get("data"))

class FakeSupabase:
    def __init__(self, responses: dict):
        """
        responses: a dict mapping table names (e.g., "flashcard_decks") to
                   the fake response that should be returned on execute().
        simulates evetything we need along with FakeTable
        """
        self.responses = responses

    def table(self, table_name: str):
        # If no response is provided for the table, default to empty list.
        response = self.responses.get(table_name, {"data": []})
        return FakeTable(table_name, response)

#Test runners
def run_test(test_func):
    """Runs a single synchronous test function and prints result."""
    try:
        test_func()
        print(f"{test_func.__name__}: PASSED")
    except AssertionError as e:
        print(f"{test_func.__name__}: FAILED (AssertionError) -> {e}")
    except Exception as e:
        print(f"{test_func.__name__}: FAILED (Exception) -> {e}")


#Tests for deck endpoints, except create_flashcard_from_file, this calls a file_service
#function which is tested in test_deck_services.py
def test_create_deck_success():
    # simulate a successful deck creation response
    fake_deck = {
        "id": "fake-deck-id",
        "user_id": "e13a4297-16ae-4342-8fbf-f45587048596",
        "name": "Test Deck",
        "category": "Test",
        "description": "A test deck",
        "created_at": "2025-03-09T00:00:00",
        "updated_at": "2025-03-09T00:00:00"
    }
    fake_response = {"data": [fake_deck]}
    # override the global supabase object in your module with the fake
    import decks
    decks.supabase = FakeSupabase({"flashcard_decks": fake_response})
    
    deck_data = DeckCreate(name="Test Deck", category="Test", description="A test deck")
    result = create_deck(deck_data, user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert result["name"] == "Test Deck", "Deck name should match"
    assert result["id"] == "fake-deck-id", "Deck ID should match the fake response"

def test_create_deck_failure():
    # Simulate a failure, nothing returned
    fake_response = {"data": None}
    import decks
    decks.supabase = FakeSupabase({"flashcard_decks": fake_response})
    
    deck_data = DeckCreate(name="Test Deck", category="Test", description="A test deck")
    try:
        create_deck(deck_data, user_id="e13a4297-16ae-4342-8fbf-f45587048596")
        assert False, "Expected HTTPException to be raised"
    except HTTPException as e:
        assert e.status_code == status.HTTP_400_BAD_REQUEST

def test_get_user_decks_success():
    fake_deck = {
        "id": "deck1",
        "user_id": "e13a4297-16ae-4342-8fbf-f45587048596",
        "name": "Test Deck",
        "category": "Test",
        "description": "A test deck",
        "created_at": "2025-03-09T00:00:00",
        "updated_at": "2025-03-09T00:00:00"
    }
    fake_response = {"data": [fake_deck]}
    import decks
    decks.supabase = FakeSupabase({"flashcard_decks": fake_response})
    
    result = get_user_decks(user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert isinstance(result, list) and len(result) == 1, "Expected one deck in the list"

def test_delete_deck_success():
    # Simulate deck existence and successful deletions.
    fake_deck_response = {"data": [{"id": "deck1"}]}
    fake_flashcard_response = {"data": [{"id": "fc1"}]}
    responses = {
        "flashcard_decks": fake_deck_response,
        "flashcards": fake_flashcard_response
    }
    import decks
    decks.supabase = FakeSupabase(responses)
    
    result = delete_deck("deck1", user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert "detail" in result and "deleted successfully" in result["detail"]

def test_delete_deck_failure():
    # Simulate deck not found.
    fake_deck_response = {"data": []}
    import decks
    decks.supabase = FakeSupabase({"flashcard_decks": fake_deck_response})
    
    try:
        delete_deck("deck1", user_id="e13a4297-16ae-4342-8fbf-f45587048596")
        assert False, "Expected HTTPException for deck not found"
    except HTTPException as e:
        assert e.status_code == status.HTTP_404_NOT_FOUND

def test_update_deck_success():
    updated_deck = {
        "id": "deck1",
        "user_id": "e13a4297-16ae-4342-8fbf-f45587048596",
        "name": "Updated Deck",
        "category": "Test",
        "description": "Updated description",
        "created_at": "2025-03-09T00:00:00",
        "updated_at": "2025-03-09T00:00:00"
    }
    fake_response = {"data": [updated_deck]}
    import decks
    decks.supabase = FakeSupabase({"flashcard_decks": fake_response})
    
    deck_update = DeckUpdate(name="Updated Deck", description="Updated description")
    result = update_deck("deck1", deck_update, user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert result["name"] == "Updated Deck", "Deck name should be updated"

def test_get_deck_flashcards_success():
    fake_deck_response = {"data": [{"id": "deck1"}]}
    fake_flashcards = [{
        "id": "fc1",
        "deck_id": "deck1",
        "question": "Q1",
        "answer": "A1",
        "created_at": "2025-03-09T00:00:00",
        "updated_at": "2025-03-09T00:00:00"
    }]
    responses = {
        "flashcard_decks": fake_deck_response,
        "flashcards": {"data": fake_flashcards}
    }
    import decks
    decks.supabase = FakeSupabase(responses)
    
    result = get_deck_flashcards("deck1", user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert isinstance(result, list) and len(result) == 1, "Should return one flashcard"

def test_create_flashcards_success():
    # simulate deck existence and successful flashcard insertion.
    fake_deck_response = {"data": [{"id": "deck1"}]}
    fake_flashcards_response = {"data": [
        {
            "id": "fc1",
            "deck_id": "deck1",
            "question": "Q1",
            "answer": "A1",
            "created_at": "2025-03-09T00:00:00",
            "updated_at": "2025-03-09T00:00:00"
        },
        {
            "id": "fc2",
            "deck_id": "deck1",
            "question": "Q2",
            "answer": "A2",
            "created_at": "2025-03-09T00:00:00",
            "updated_at": "2025-03-09T00:00:00"
        }
    ]}
    responses = {
        "flashcard_decks": fake_deck_response,
        "flashcards": fake_flashcards_response
    }
    import decks
    decks.supabase = FakeSupabase(responses)
    
    flashcards = [
        FlashcardCreate(question="Q1", answer="A1"),
        FlashcardCreate(question="Q2", answer="A2")
    ]
    result = create_flashcards("deck1", flashcards, user_id="e13a4297-16ae-4342-8fbf-f45587048596")
    assert isinstance(result, list) and len(result) == 2, "Expected two flashcards created"


#Main function
async def main():
    run_test(test_create_deck_success)
    run_test(test_create_deck_failure)
    run_test(test_get_user_decks_success)
    run_test(test_delete_deck_success)
    run_test(test_delete_deck_failure)
    run_test(test_update_deck_success)
    run_test(test_get_deck_flashcards_success)
    run_test(test_create_flashcards_success)


if __name__ == "__main__":
    asyncio.run(main())
