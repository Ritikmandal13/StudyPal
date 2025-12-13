# Prompts

Located in `backend/src/prompts/`.

## notesPrompt.txt
- 5–8 bullets, key concepts, formulas/dates, no hallucination.

## flashcardPrompt.txt
- 3–5 Q&A per chunk, concise answers, varied question types, JSON array output.

## quizPrompt.txt
- 5 MCQs, 4 options, one correct, mix difficulty, JSON array output with explanations.

## Example Input (chunk)
```
Photosynthesis is the process by which green plants convert light energy into chemical energy...
```

## Example Outputs (abridged)
- Notes: bullet list of key steps, chlorophyll role, light vs dark reactions.
- Flashcards: Q about definition, purpose, role of chlorophyll, difference between stages.
- Quiz: MCQ on equation, energy conversion, location (chloroplasts), limiting factors.

