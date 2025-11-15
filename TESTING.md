# Testing Guide for Obsidian Scribe

## Testing File Selection Feature

### Prerequisites
- At least one audio file in your Obsidian vault
- Whisper-ASR or other transcription service configured
- LLM provider configured (OpenAI, Claude, or Ollama)

### Test Steps

#### Basic File Selection Test
1. Place a test audio file (MP3, WAV, etc.) in your vault
2. Open Command Palette (Ctrl/Cmd+P)
3. Run: "Select and transcribe audio file"
4. Verify modal opens and shows your audio file
5. Select the file
6. Click "Process"
7. Verify transcription begins
8. Verify new note is created with summary

#### Expected Behavior
- Modal shows all audio files in vault
- Selected file is highlighted
- Processing creates new note with transcription and summary
- Empty vault shows helpful message

#### Test Cases

**Test Case 1: Single File Selection**
- Place one audio file in vault
- Open file picker
- Verify file appears
- Select and process
- Verify transcription completes

**Test Case 2: Multiple Files**
- Place multiple audio files in vault
- Open file picker
- Verify all files appear
- Select one file
- Verify only selected file is processed

**Test Case 3: Empty Vault**
- Remove all audio files from vault
- Open file picker
- Verify empty state message appears
- Verify no errors occur

**Test Case 4: Nested Folders**
- Place audio files in nested folders
- Open file picker
- Verify files from all folders appear
- Select file from nested folder
- Verify file path is correct

**Test Case 5: Different Audio Formats**
- Test with WebM file
- Test with MP3 file
- Test with WAV file
- Test with M4A file
- Test with OGG file
- Test with FLAC file
- Verify all formats are supported

**Test Case 6: Cancel Operation**
- Open file picker
- Select a file
- Close modal without clicking "Process"
- Verify no processing occurs

**Test Case 7: Large File**
- Test with large audio file (>10MB)
- Verify processing completes
- Verify no timeout errors

### Known Limitations
- Processing time depends on audio file length
- Transcription quality depends on audio quality
- LLM provider may affect summarization quality

### Troubleshooting
- If transcription fails, check transcription service configuration
- If summarization fails, check LLM provider configuration
- If modal doesn't open, check console for errors
- If files don't appear, verify audio files are in vault

## Testing Recording Feature

### Prerequisites
- Microphone access granted
- Transcription service configured
- LLM provider configured

### Test Steps
1. Click ribbon button or use command palette
2. Open Scribe controls modal
3. Click "Start Recording"
4. Speak for 10-30 seconds
5. Click "Stop Recording"
6. Verify transcription begins
7. Verify new note is created

### Expected Behavior
- Audio is recorded correctly
- Transcription matches spoken words
- Summary captures key points
- Mermaid chart visualizes content (if applicable)

## Testing Interactive Queries

### Prerequisites
- Same as recording feature

### Test Steps
1. Start recording
2. Say "Hey Scribe, what is artificial intelligence?"
3. Continue speaking normally
4. Stop recording
5. Verify query answer appears in transcript
6. Verify answer is integrated into note

### Expected Behavior
- Query is detected
- Answer is fetched during recording
- Answer appears in correct position in transcript

## Testing Different Providers

### OpenAI
- Configure OpenAI API key
- Test transcription with Whisper
- Test summarization with GPT-4o

### Claude (Anthropic)
- Configure Claude API key
- Test summarization with Claude Sonnet 4.5

### Ollama (Local)
- Install and configure Ollama
- Pull model (e.g., llama3.1:8b)
- Test summarization with local model

### Whisper-ASR (Local)
- Install and run Whisper-ASR server
- Configure base URL
- Test transcription with local service

### AssemblyAI
- Configure AssemblyAI API key
- Test transcription with AssemblyAI

## Automated Testing (Future)

Currently, testing is manual. Future improvements could include:
- Unit tests for core functions
- Integration tests for API calls
- E2E tests for full workflow
- Mock audio files for consistent testing

## Reporting Issues

When reporting issues, please include:
- Obsidian version
- Plugin version
- Operating system
- Transcription service used
- LLM provider used
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)
