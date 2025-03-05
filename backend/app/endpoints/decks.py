from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from dotenv import load_dotenv
import os
from app.services.file_service import process_file

from supabase import create_client, Client
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()
router = APIRouter()


def get_current_user():
    """
    Mock function returning a user_id.
    This is hardcoded to the one created accounts, but will have to be updated.
    """

    return "e13a4297-16ae-4342-8fbf-f45587048596"


class DeckCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class DeckUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class DeckOut(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

class FlashcardCreate(BaseModel):
    question: str
    answer: str

class FlashcardOut(BaseModel):
    id: str
    deck_id: str
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime


# CREATE a new deck for a user
# POST /api/decks
@router.post("/api/decks", response_model=DeckOut)
def create_deck(deck_data: DeckCreate, user_id: str = Depends(get_current_user)):
    """
    Create a new deck owned by the current user.
    """
    new_deck_id = str(uuid.uuid4())

    response = (
        supabase
        .table("flashcard_decks")
        .insert({
            "id": new_deck_id,
            "user_id": user_id,
            "name": deck_data.name,
            "category": deck_data.category,
            "description": deck_data.description
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create deck."
        )
    return response.data[0]


# GET all decks for a user
# GET /api/decks
@router.get("/api/decks", response_model=List[DeckOut])
def get_user_decks(user_id: str = Depends(get_current_user)):
    """
    Get all decks belonging to the current user.
    """
    print('getting decks')
    response = (
        supabase
        .table("flashcard_decks")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return response.data 


# DELETE a specific deck
# DELETE /api/decks/:deck_id
@router.delete("/api/decks/{deck_id}")
def delete_deck(deck_id: str, user_id: str = Depends(get_current_user)):
    """
    Delete a deck if it belongs to the current user.
    """
    response = (
        supabase
        .table("flashcard_decks")
        .delete()
        .match({"id": deck_id, "user_id": user_id})
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found or not owned by user."
        )

    return {"detail": "Deck deleted successfully."}


# UPDATE a deck
# PATCH /api/decks/:deck_id
@router.patch("/api/decks/{deck_id}", response_model=DeckOut)
def update_deck(deck_id: str, deck_data: DeckUpdate, user_id: str = Depends(get_current_user)):
    """
    Update the deck's name, category, or description if owned by the current user.
    """
    update_dict = {k: v for k, v in deck_data.dict().items() if v is not None}

    response = (
        supabase
        .table("flashcard_decks")
        .update(update_dict)
        .match({"id": deck_id, "user_id": user_id})
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found or not owned by user."
        )

    return response.data[0]


# GET all flashcards for a given deck
# GET /api/decks/:deck_id/flashcards
@router.get("/api/decks/{deck_id}/flashcards", response_model=List[FlashcardOut])
def get_deck_flashcards(deck_id: str, user_id: str = Depends(get_current_user)):
    """
    Get all flashcards in a specific deck if the deck is owned by the current user.
    """
    print("getting flashcards for deck", deck_id)
    deck_check = (
        supabase
        .table("flashcard_decks")
        .select("id")
        .match({"id": deck_id, "user_id": user_id})
        .execute()
    )
    if not deck_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found or not owned by user."
        )

    response = (
        supabase
        .table("flashcards")
        .select("*")
        .eq("deck_id", deck_id)
        .execute()
    )
    return response.data


# CREATE new flashcards for a given deck
# POST /api/decks/:deck_id/flashcards
@router.post("/api/decks/{deck_id}/flashcards", response_model=List[FlashcardOut])
def create_flashcards(deck_id: str, flashcards: List[FlashcardCreate], user_id: str = Depends(get_current_user)):
    """
    Create multiple flashcards for a given deck, if that deck belongs to the current user.
    """
    deck_check = (
        supabase
        .table("flashcard_decks")
        .select("id")
        .match({"id": deck_id, "user_id": user_id})
        .execute()
    )
    if not deck_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found or not owned by user."
        )

    flashcard_entries = []
    for fc in flashcards:
        flashcard_entries.append({
            "id": str(uuid.uuid4()),
            "deck_id": deck_id,
            "question": fc.question,
            "answer": fc.answer,
        })

    response = supabase.table("flashcards").insert(flashcard_entries).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create flashcards."
        )

    return response.data


@router.post("/api/decks/{deck_id}/flashcards/file", summary="Upload and process a file")
async def create_flashcards_from_file(deck_id: str, file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """
    Create multiple flashcards for a given deck, if that deck belongs to the current user.
    """
    # Load the file
    print("called create_flashcards_from_file")
    file_content = await file.read()
    flashcards = await process_file(file_content)

    print("processed file")

    flashcard_entries = []
    for i, (question, answer) in enumerate(flashcards):
        flashcard_entries.append({
            "id": str(uuid.uuid4()),
            "deck_id": deck_id,
            "question": question,
            "answer": answer,
        })

#     for i, (question, answer) in enumerate(flashcards):

    if not file_content:
        raise HTTPException(status_code=400, detail="File content is empty.")
    
    deck_check = (
        supabase
        .table("flashcard_decks")
        .select("id")
        .match({"id": deck_id, "user_id": user_id})
        .execute()
    )
    if not deck_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found or not owned by user."
        )


    response = supabase.table("flashcards").insert(flashcard_entries).execute()

    print("inserted into supabase")

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create flashcards."
        )

    return response.data