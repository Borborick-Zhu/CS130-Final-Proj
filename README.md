# QuickThink

## Description
QuickThink is an AI-powered flashcard service where users can simply upload their PDFs into the application and have study flashcards automatically generated. 

## Setup
QuickThink is easily accessible via our website: 

## Tech Stack
- Frontend: React
- Backend: Supabase
- Deployment: GCP Instance in conjunction to Github Actions.
- CR: Gerrit

## Data-flow
- **PDF Ingestion:**
    - User uploads a PDF via **/api/pdf/upload**.
    - The backend stores the PDF on Amazon S3 and records metadata in **PDF_Documents**.
    - An AI service processes the PDF to extract text and summarize content, updating the **raw_text** and **summary** fields.
- **Flashcard Generation:**
    - The processed PDF is sent to **/api/flashcards/generate**.
    - AI converts the extracted text into a series of flashcards stored in **Flashcards**, and a new deck is created in **Flashcard_Decks**.
- **User Interaction & Management:**
    - The user manages decks and flashcards via the provided endpoints.
    - The frontend React app uses these endpoints to fetch, display, update, and delete flashcard data.
    - Additional endpoints support authentication and user management.
