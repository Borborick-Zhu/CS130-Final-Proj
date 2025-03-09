# QuickThink

## Description
QuickThink is an AI-powered flashcard service where users can simply upload their PDFs into the application and have study flashcards automatically generated. 

## Tech Stack
- Frontend: React
- Backend: Supabase
- Deployment: GCP Instance in conjunction with Github Actions
- CR: Gerrit

## Data-flow
- **PDF Ingestion:**
    - User uploads a PDF via **/api/pdf/upload**.
    - LlamaParse service processes the PDF to extract key text and summarize content.
- **Flashcard Generation:**
    - The processed PDF is then sent to the OpenAI API awhich converts the extracted text into a series of flashcards based on a configurable chunk-size.
- **User Interaction & Management:**
    - The user manages decks and flashcards via the provided endpoints.
    - The frontend React app uses these endpoints to fetch, display, update, and delete flashcard data.
    - Additional endpoints support authentication and user management.

## Directory Structure
- **.github/**: Contains the main CICD pipeline yml file (github-ci.yml) 
- **backend/**: Contains all API-related logic, documentation, and dependencies
    - FastAPI in Python
    - Swagger documentation of API endpoints
- **src/**: Contains all frontend-related pages, components, and dependencies
