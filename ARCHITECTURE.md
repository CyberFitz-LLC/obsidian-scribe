# Obsidian Scribe Plugin - Comprehensive Codebase Analysis

## 1. Project Overview

### What is Obsidian Scribe?
Obsidian Scribe is an Obsidian plugin that transforms voice notes into structured knowledge. It records audio, transcribes it using AI (Whisper or AssemblyAI), and generates enriched summaries with insights, Mermaid charts, and answered questions using OpenAI's language models.

**Core Value Proposition:**
- Record voice notes directly in Obsidian
- Automatic transcription with high accuracy
- AI-powered summarization and insight generation
- Interactive mid-recording queries ("Hey Scribe" feature)
- Mermaid chart visualization of concepts
- Mobile-friendly with progressive failure handling

**Target Platform:**
- Obsidian (cross-platform: desktop and mobile)
- Version: 2.1.4
- Minimum Obsidian version: 0.15.0

---

## 2. Technical Stack

### Languages & Frameworks
- **TypeScript** - Primary language (ES6 target)
- **React 19.1.0** - UI components (settings, modals)
- **JSX** - React components with `react-jsx` transform

### Key Dependencies

**AI & Transcription:**
- `openai` (^4.85.4) - OpenAI API client for Whisper transcription and ChatGPT summarization
- `@langchain/openai` (^0.5.10) - Structured output generation with Zod schemas
- `@langchain/core` (^0.3.40) - LangChain core abstractions
- `assemblyai` (^4.9.0) - Alternative transcription service with speaker diarization
- `langchain` (^0.3.19) - Language model orchestration

**Audio Processing:**
- `@ffmpeg/ffmpeg` (^0.12.15) - WebM to MP3 conversion (client-side)
- `@ffmpeg/util` (^0.12.2) - FFmpeg utilities
- `@fix-webm-duration/fix` (^1.0.1) - WebM duration metadata fixing

**Utilities:**
- `zod` (^3.24.2) - Schema validation for LLM outputs
- `mini-debounce` (^1.0.8) - Input debouncing in settings

**Obsidian Integration:**
- `obsidian` (latest) - Official Obsidian API
- `react-dom` (^19.1.0) - React rendering in Obsidian modals

### Build System & Tooling
- **esbuild** (^0.25.0) - Fast bundler for production and development
- **TypeScript** (^5.8.3) - Type checking and compilation
- **Biome** (1.9.4) - Linting and formatting
- **dotenv** (^16.4.7) - Environment variable management for development
- **Vitest** - Testing framework (configured but used for Claude Collective tests)

---

## 3. Codebase Structure

```
obsidian-scribe/
├── main.ts                          # Plugin entry point (re-exports src/index)
├── manifest.json                    # Obsidian plugin manifest
├── package.json                     # NPM dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── esbuild.config.mjs              # Build configuration with hot-reload support
├── version-bump.mjs                # Version sync script
├── versions.json                    # Version compatibility matrix
├── vitest.config.js                # Test configuration
│
├── src/
│   ├── index.ts                     # Main plugin class (ScribePlugin)
│   ├── styles.css                   # Plugin UI styles
│   │
│   ├── audioRecord/
│   │   └── audioRecord.ts          # AudioRecord class - handles recording, pause/resume, format conversion
│   │
│   ├── commands/
│   │   └── commands.ts             # Obsidian command palette integrations
│   │
│   ├── modal/
│   │   ├── scribeControlsModal.tsx # Main recording control modal (React)
│   │   ├── components/
│   │   │   ├── ModalOptionsContainer.tsx       # Options panel wrapper
│   │   │   ├── ModalRecordingButtons.tsx       # Start/Stop/Pause buttons
│   │   │   ├── ModalRecordingTimer.tsx         # Recording duration display
│   │   │   └── options/
│   │   │       ├── ModalAiModelOptions.tsx     # AI model selection
│   │   │       ├── ModalLanguageOptions.tsx    # Language settings
│   │   │       └── ModalRecordingOptions.tsx   # Recording preferences
│   │   └── icons/
│   │       └── icons.tsx           # React icon components
│   │
│   ├── ribbon/
│   │   └── ribbon.ts               # Left sidebar ribbon button with dropdown menu
│   │
│   ├── settings/
│   │   ├── settings.tsx            # Settings tab registration and main component
│   │   └── components/
│   │       ├── AiModelSettings.tsx             # AI platform and model configuration
│   │       ├── AudioDeviceSettings.tsx         # Microphone selection
│   │       ├── FileNameSettings.tsx            # File naming patterns
│   │       ├── NoteTemplateSettings.tsx        # Custom prompt templates (key feature)
│   │       └── SettingsItem.tsx                # Reusable settings component wrapper
│   │
│   └── util/
│       ├── assemblyAiUtil.ts       # AssemblyAI transcription with speaker diarization
│       ├── audioDataToChunkedFiles.ts  # Audio chunking for large files (25MB limit)
│       ├── consts.ts               # Language options and recording status enums
│       ├── filenameUtils.ts        # Filename prefix formatting with date/time
│       ├── fileUtils.ts            # Vault operations (create, rename, append, frontmatter)
│       ├── mimeType.ts             # Supported audio formats and MIME type detection
│       ├── openAiUtils.ts          # OpenAI Whisper transcription and ChatGPT summarization
│       ├── pathUtils.ts            # Default path resolution for notes and recordings
│       ├── textUtil.ts             # Mermaid chart extraction and JSON key sanitization
│       └── useDebounce.tsx         # React debounce hook
│
├── build/                          # Generated bundle output (gitignored)
├── .claude/                        # Claude Code Collective configuration
├── .claude-collective/             # Claude Code Collective framework
└── .archon/                        # Archon MCP server configuration
```

---

## 4. Core Components & Architecture

### Main Plugin Class: `ScribePlugin` (`src/index.ts`)

**Extends:** Obsidian's `Plugin` class

**Key Properties:**
```typescript
settings: ScribePluginSettings      // User configuration
state: ScribeState                   // Runtime state (recording, modal status)
controlModal: ScribeControlsModal    // Recording UI modal
```

**Core Lifecycle:**
```typescript
onload() → workspace.onLayoutReady() → {
  loadSettings()
  handleRibbon()      // Add sidebar icon
  handleCommands()    // Register command palette
  handleSettingsTab() // Add settings panel
}
```

**Main Workflows:**

1. **Recording Workflow:**
```typescript
startRecording() → AudioRecord.startRecording()
  ↓
handlePauseResumeRecording() → AudioRecord.handlePauseResume()
  ↓
scribe() → handleStopAndSaveRecording() → handleScribeFile()
```

2. **Scribe File Processing:**
```typescript
handleScribeFile() {
  1. Create/append to note
  2. Setup frontmatter
  3. handleTranscription() → OpenAI Whisper or AssemblyAI
  4. handleTranscriptSummary() → ChatGPT with structured output
  5. Append sections based on template
  6. Rename file with AI-generated title
}
```

### Audio Recording: `AudioRecord` (`src/audioRecord/audioRecord.ts`)

**Purpose:** Manages browser MediaRecorder API with format conversion support

**Key Features:**
- WebM recording with Opus codec (default)
- Client-side MP3 conversion using FFmpeg WASM
- Duration metadata fixing for WebM files
- Device selection support
- Pause/resume capability

**Format Conversion Flow:**
```typescript
stopRecording() → {
  if (desiredFormat === 'mp3'):
    fixWebmDuration(webmBlob) → convertWebmToMp3(webmBlob)
  else:
    fixWebmDuration(webmBlob)
}
```

### AI Processing: `openAiUtils.ts` & `assemblyAiUtil.ts`

**OpenAI Whisper Transcription:**
```typescript
chunkAndTranscribeWithOpenAi() {
  1. Split audio into 25MB chunks (OpenAI limit)
  2. Convert chunks to mono WAV
  3. Transcribe each chunk with Whisper
  4. Concatenate results
}
```

**Structured Summarization (LangChain + Zod):**
```typescript
summarizeTranscript() {
  1. Build Zod schema from template sections
  2. Create ChatOpenAI client with structured output
  3. Generate system message with instructions
  4. Parse structured response (fileTitle, summary, insights, mermaidChart, etc.)
}
```

**AssemblyAI Features:**
- Speaker diarization (multi-speaker support)
- Paragraph formatting
- Language detection
- Higher accuracy for certain use cases

### Settings & Templates: `settings.tsx` & `NoteTemplateSettings.tsx`

**ScribePluginSettings Interface:**
```typescript
{
  openAiApiKey: string              // Required for transcription/summarization
  assemblyAiApiKey?: string         // Optional alternative transcription
  transcriptPlatform: TRANSCRIPT_PLATFORM  // 'openAi' | 'assemblyAi'
  llmModel: LLM_MODELS             // GPT model selection
  audioFileFormat: 'webm' | 'mp3'  // Recording format
  selectedAudioDeviceId?: string    // Microphone selection
  noteFilenamePrefix: string        // Note naming pattern
  recordingFilenamePrefix: string   // Audio file naming pattern
  dateFilenameFormat: string        // Moment.js date format
  recordingDirectory: string        // Audio storage path
  transcriptDirectory: string       // Note storage path
  activeNoteTemplate: ScribeTemplate  // Custom prompt template (KEY FEATURE)
  // ... other flags
}
```

**Template System (Critical Feature):**
```typescript
ScribeTemplate {
  id: string
  name: string
  sections: TemplateSection[]
}

TemplateSection {
  id: string
  sectionHeader: string           // Markdown heading (## Summary)
  sectionInstructions: string     // Prompt for LLM
  isSectionOptional?: boolean     // Skip if no content
  sectionOutputPrefix?: string    // E.g., ```mermaid
  sectionOutputPostfix?: string   // E.g., ```
}
```

**Default Template Sections:**
1. Summary - Bullet point summary
2. Insights - Improvement suggestions
3. Mermaid Chart - Concept visualization
4. Answered Questions - "Hey Scribe" responses (optional)

### Modal Controls: `scribeControlsModal.tsx`

**React-based UI:**
- Recording timer with pause/resume
- Start/Stop/Save buttons with state management
- Options panel with live settings override
- API key validation warning

**State Management:**
```typescript
recordingState: 'inactive' | 'recording' | 'paused'
scribeOptions: ScribeOptions  // Per-recording settings override
```

### File Operations: `fileUtils.ts`

**Key Functions:**
```typescript
saveAudioRecording()      // Save to vault with collision handling
createNewNote()           // Create markdown file
renameFile()              // Rename with AI-generated title
setupFileFrontmatter()    // Add audio links and metadata
appendTextToNote()        // Progressive content addition
```

**Frontmatter Management:**
```yaml
---
audio:
  - [[path/to/recording.webm]]
created_by: [[Scribe]]
---
```

---

## 5. Configuration & Settings

### Environment Configuration (`.env`)
```bash
OBSIDIAN_PLUGINS_PATH="/path/to/vault/.obsidian/plugins"
```
Used by esbuild for hot-reload during development.

### Build Configuration (`esbuild.config.mjs`)

**Key Features:**
- Entry point: `main.ts` → `build/main.js`
- Watch mode for development
- Production minification
- Auto-copy to Obsidian plugins folder
- Hot-reload file generation (`.hotreload`)
- External dependencies (Obsidian API, CodeMirror)

**Build Modes:**
```bash
npm run dev           # Watch mode with hot-reload
npm run build:prod    # Production bundle
```

### TypeScript Configuration (`tsconfig.json`)

**Compiler Options:**
- JSX: `react-jsx` (automatic React 19 transform)
- Target: ES6
- Module: ESNext
- Strict null checks enabled
- Inline source maps for debugging

---

## 6. Build & Development Workflow

### Development Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
OBSIDIAN_PLUGINS_PATH="/Users/you/vault/.obsidian/plugins"
```

3. **Start development server:**
```bash
npm run dev
```

**What happens:**
- esbuild watches for changes
- Auto-compiles to `build/main.js`
- Copies to Obsidian plugins folder
- Creates `.hotreload` file
- Install [hot-reload plugin](https://github.com/pjeby/hot-reload) for instant plugin reload

### Production Build

```bash
npm run build:prod
```

**Output:**
- `build/main.js` (minified, no sourcemaps)
- `build/styles.css`
- `build/manifest.json`

### Version Management

```bash
npm version patch  # or minor/major
```

**Automated by `version-bump.mjs`:**
1. Updates `manifest.json` version
2. Updates `versions.json` compatibility matrix
3. Git commits changes

### Available Scripts

```json
{
  "dev": "node esbuild.config.mjs",
  "build:prod": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
  "version": "node version-bump.mjs && git add manifest.json versions.json",
  "update-all-deps": "npm outdated | awk 'NR>1 {print $1\"@\"$4}' | xargs npm install"
}
```

### Testing Setup

**Vitest Configuration** (`vitest.config.js`)
- Currently configured for Claude Collective tests
- Not actively used for plugin testing
- Environment: Node.js
- Test pattern: `.claude-collective/tests/**/*.test.js`

---

## 7. Key Files to Understand Before Modifications

### Critical Path (Must Understand):

1. **`src/index.ts`** (500 lines) - Plugin orchestration, main workflows
2. **`src/audioRecord/audioRecord.ts`** - Recording state machine
3. **`src/util/openAiUtils.ts`** - AI integration logic
4. **`src/settings/components/NoteTemplateSettings.tsx`** - Template system (extensibility point)
5. **`manifest.json`** - Plugin metadata and versioning

### Important for Extensions:

6. **`src/commands/commands.ts`** - Adding new commands
7. **`src/ribbon/ribbon.ts`** - Modifying UI entry points
8. **`src/util/fileUtils.ts`** - Vault operations
9. **`src/modal/scribeControlsModal.tsx`** - UI customization
10. **`esbuild.config.mjs`** - Build customization

### Reference Files:

11. **`src/util/consts.ts`** - Language options
12. **`src/util/mimeType.ts`** - Supported formats
13. **`src/util/audioDataToChunkedFiles.ts`** - Audio processing details
14. **`src/util/assemblyAiUtil.ts`** - Alternative transcription

---

## 8. Dependencies & Integration Points

### External Libraries & Their Roles

**OpenAI Integration:**
- **Purpose:** Whisper transcription + GPT-4 summarization
- **Usage:** Browser-safe client with `dangerouslyAllowBrowser: true`
- **Chunking:** 25MB max file size for Whisper API
- **Custom endpoints:** Support for `customBaseUrl` (e.g., Gemini via OpenAI-compatible endpoints)

**LangChain Integration:**
- **Purpose:** Structured output generation with Zod schemas
- **Pattern:** `ChatOpenAI.withStructuredOutput(zodSchema)`
- **Why:** Type-safe parsing of LLM responses into template sections

**AssemblyAI Integration:**
- **Purpose:** Alternative transcription with speaker diarization
- **Advantages:** Speaker labels, paragraph formatting, multi-language
- **API Key:** Optional (free tier available)

**FFmpeg WASM:**
- **Purpose:** Client-side WebM → MP3 conversion
- **CDN:** `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd`
- **Why:** Mobile compatibility, smaller file sizes

### Obsidian API Usage Patterns

**Plugin Lifecycle:**
```typescript
workspace.onLayoutReady() // Wait for full bootstrap
addRibbonIcon()           // Left sidebar
addCommand()              // Command palette
addSettingTab()           // Settings panel
```

**Vault Operations:**
```typescript
vault.create(path, content)
vault.createBinary(path, arrayBuffer)
vault.readBinary(file)
vault.process(file, callback)  // Safe read-modify-write
fileManager.processFrontMatter()
fileManager.renameFile()
```

**Workspace Integration:**
```typescript
workspace.getActiveFile()
workspace.openLinkText(path, currentPath, newLeaf)
```

**Notice System:**
```typescript
new Notice('Message')  // User feedback for all operations
```

### Third-Party Service Integrations

**OpenAI API:**
- Endpoint: `https://api.openai.com/v1`
- Models: GPT-4.1, GPT-4o, GPT-4-turbo (configurable)
- Whisper: `whisper-1` model
- Custom base URLs supported (Gemini compatibility)

**AssemblyAI API:**
- Endpoint: Built into SDK
- Features: Transcription, speaker labels, paragraphs
- Language: Auto-detect or explicit

---

## 9. Modification Guidelines

### Areas That Are Extensible

**1. Template System (Highly Extensible)**
- **Location:** `src/settings/components/NoteTemplateSettings.tsx`
- **Pattern:** Add new `TemplateSection` definitions
- **Use Cases:**
  - Custom summarization formats
  - Domain-specific prompts (meeting notes, research, brainstorming)
  - Multi-language outputs
  - Integration with other Obsidian plugins (Dataview, Tasks)

**Example Extension:**
```typescript
const MEETING_NOTES_TEMPLATE: ScribeTemplate = {
  id: 'meeting',
  name: 'Meeting Notes',
  sections: [
    {
      id: '1',
      sectionHeader: 'Attendees',
      sectionInstructions: 'Extract all mentioned names and roles',
    },
    {
      id: '2',
      sectionHeader: 'Action Items',
      sectionInstructions: 'List all tasks with owners and deadlines',
    },
    // ... more sections
  ]
}
```

**2. AI Model Integration (Moderate Extensibility)**
- **Location:** `src/util/openAiUtils.ts`, `src/settings/components/AiModelSettings.tsx`
- **Pattern:** Add new LLM providers using OpenAI-compatible endpoints
- **Current Support:** Custom base URLs for Gemini, local models
- **Extension Points:**
  - Add new `LLM_MODELS` enum values
  - Update `summarizeTranscript()` model selection
  - Add provider-specific settings

**3. Commands & Shortcuts (Easy Extension)**
- **Location:** `src/commands/commands.ts`
- **Pattern:** `plugin.addCommand({ id, name, callback })`
- **Use Cases:**
  - Quick record with preset options
  - Batch transcribe folder
  - Template-specific shortcuts

**4. File Organization (Easy Extension)**
- **Location:** `src/util/fileUtils.ts`, `src/util/pathUtils.ts`
- **Pattern:** Add custom path resolution logic
- **Use Cases:**
  - Tag-based folders
  - Date-based hierarchies
  - Project-based organization

**5. Audio Processing (Moderate Extension)**
- **Location:** `src/audioRecord/audioRecord.ts`
- **Pattern:** Add new format converters
- **Use Cases:**
  - FLAC, OGG support
  - Noise reduction preprocessing
  - Audio normalization

### Potential Pain Points & Tightly Coupled Areas

**1. State Management (Tightly Coupled)**
- **Issue:** Plugin state scattered across `ScribePlugin.state`, modal state, and settings
- **Impact:** Difficult to add features requiring global state changes
- **Recommendation:** Consider centralizing state with React Context or similar

**2. Recording Lifecycle (Complex State Machine)**
- **Issue:** Recording state flows through multiple components
- **Flow:** `AudioRecord.mediaRecorder.state` → `ScribeModal.recordingState` → UI buttons
- **Impact:** Adding new recording states (e.g., "processing") requires changes in 3+ files
- **Recommendation:** Document state transitions before modifying

**3. Transcription Chunking (Technical Complexity)**
- **Location:** `src/util/audioDataToChunkedFiles.ts`
- **Issue:** Audio chunking uses Web Audio API, complex buffer manipulation
- **Impact:** Bugs here can cause transcription failures or data loss
- **Recommendation:** Extensive testing required for changes

**4. Template → Zod Schema Generation (Magic Code)**
- **Location:** `src/util/openAiUtils.ts` (lines 95-150)
- **Issue:** Dynamic Zod schema construction from template sections
- **Impact:** Breaking changes affect all template features
- **Code Smell:** Contains conversion logic (`convertToSafeJsonKey`)
- **Recommendation:** Add comprehensive tests before modifying

**5. File Path Resolution (Platform-Specific)**
- **Location:** `src/util/pathUtils.ts`, `src/util/fileUtils.ts`
- **Issue:** Path normalization differs between desktop/mobile
- **Impact:** File creation bugs are platform-specific
- **Recommendation:** Test on both platforms for path changes

**6. FFmpeg Loading (Browser Limitations)**
- **Location:** `src/audioRecord/audioRecord.ts` (convertWebmToMp3)
- **Issue:** Loads FFmpeg from CDN, can fail on slow connections
- **Impact:** MP3 conversion failures on mobile/offline
- **Recommendation:** Consider bundling FFmpeg or adding retry logic

### Recommended Approach for Adding Features

**Feature Addition Workflow:**

1. **Research Phase:**
   - Check if feature requires new dependencies
   - Identify affected components (usually 2-4 files)
   - Review existing patterns in codebase

2. **Planning:**
   - Does it need new settings? → `settings.tsx`
   - Does it need new commands? → `commands.ts`
   - Does it modify recording flow? → Document state changes
   - Does it change AI behavior? → Update templates or prompts

3. **Implementation Pattern:**
```
Settings → Plugin Method → Utility Function → UI Feedback
```

**Example: Adding "Auto-transcribe on save" feature**

```typescript
// 1. Add setting
interface ScribePluginSettings {
  // ... existing settings
  autoTranscribeOnSave: boolean
}

// 2. Add plugin method
async onFileModify(file: TFile) {
  if (!this.settings.autoTranscribeOnSave) return
  if (file.extension !== 'webm') return

  await this.scribeExistingFile(file)
}

// 3. Register event handler
this.registerEvent(
  this.app.vault.on('modify', this.onFileModify.bind(this))
)

// 4. Add UI toggle in settings
```

4. **Testing Checklist:**
- [ ] Desktop recording
- [ ] Mobile recording (screen on requirement)
- [ ] OpenAI transcription
- [ ] AssemblyAI transcription (if relevant)
- [ ] Template rendering
- [ ] File path resolution
- [ ] Error handling (no API key, network failure)

5. **Documentation:**
- Update README.md with new feature
- Add command descriptions
- Update settings tooltips

---

## 10. Architecture Insights

### Design Patterns Used

**1. Plugin Pattern (Obsidian Standard):**
```typescript
class ScribePlugin extends Plugin {
  onload() { /* initialization */ }
  onunload() { /* cleanup */ }
}
```

**2. Factory Pattern (Audio Format Selection):**
```typescript
const mimeType = pickMimeType(preferred)  // Falls back to supported format
```

**3. Strategy Pattern (Transcription Services):**
```typescript
transcript = settings.transcriptPlatform === 'assemblyAi'
  ? await transcribeAudioWithAssemblyAi(...)
  : await chunkAndTranscribeWithOpenAi(...)
```

**4. Builder Pattern (LLM Prompts):**
```typescript
const systemMessage = new SystemMessage({
  content: buildPromptFromTemplate(template, language)
})
```

**5. Observer Pattern (React State):**
```typescript
const [recordingState, setRecordingState] = useState('inactive')
// UI auto-updates on state changes
```

### Data Flow Architecture

**High-Level Flow:**
```
User Action (Ribbon/Command)
  ↓
ScribePlugin Method (orchestration)
  ↓
AudioRecord (recording) + OpenAI/AssemblyAI (transcription)
  ↓
FileUtils (note creation/modification)
  ↓
Notice (user feedback)
```

**Template-Based Generation Flow:**
```
NoteTemplateSettings (User Definition)
  ↓
ScribeOptions.activeNoteTemplate (Runtime Configuration)
  ↓
summarizeTranscript() (Zod Schema Generation)
  ↓
ChatOpenAI.withStructuredOutput() (Typed LLM Response)
  ↓
Dynamic Section Rendering (Markdown Assembly)
```

### Error Handling Strategy

**Pattern: Notice + Console + Graceful Degradation**

```typescript
try {
  const result = await riskyOperation()
} catch (error) {
  new Notice(`Scribe: ⚠️ Operation failed ${error.toString()}`)
  console.error('Scribe: Detailed error', error)
  // Continue or cleanup without crashing
}
```

**Critical Paths:**
- Recording failures → Don't lose audio
- Transcription failures → Keep audio file
- Summarization failures → Keep transcript
- File save failures → Retry with UUID suffix

### Performance Considerations

**1. Lazy Loading:**
- FFmpeg loaded only when MP3 conversion needed
- Settings components mount only when tab opened

**2. Progressive Rendering:**
```typescript
appendTextToNote(note, '# Audio in progress')  // Immediate feedback
// ... transcription ...
appendTextToNote(note, transcript, '# Audio in progress')  // Replace
// ... summarization ...
appendTextToNote(note, summary)  // Append
```

**3. Audio Chunking:**
- Large files split to avoid memory issues
- Streaming-style processing with chunk callbacks

**4. Debouncing:**
- Settings input uses `useDebounce` hook
- Prevents excessive re-renders

### Security Considerations

**API Key Storage:**
- Stored in `data.json` (Obsidian's plugin data)
- Not encrypted by plugin (relies on Obsidian's security)
- Browser-based OpenAI client requires `dangerouslyAllowBrowser: true`

**Recommendations for Production:**
- Warn users about API key security
- Consider vault-level encryption
- Implement API key validation before operations

**Audio Privacy:**
- Audio files stored locally in vault
- Transcription sent to external APIs (OpenAI/AssemblyAI)
- Option to disable LLM transcription (`isDisableLlmTranscription`)

---

## 11. Recent Changes & Git Context

**Latest Commits:**
```
4558a6f - Bumps version for revert
453703d - Revert "Fix issues, related to use of gemini openai-compatible endpoints (#68)"
adda824 - Bumps versions
7ca2874 - Fix issues, related to use of gemini openai-compatible endpoints (#68)
```

**Observations:**
- Recently added custom OpenAI base URL support (reverted, then re-added)
- Gemini integration via OpenAI-compatible endpoints
- Active development on AI provider flexibility

**Unstaged Changes:**
```
M package-lock.json
M package.json
?? .archon/
?? .claude/
?? .claude-collective/
?? CLAUDE.md
?? vitest.config.js
```

**Current Branch:** `main`

---

## 12. Extension Ideas & Future Directions

### Low-Hanging Fruit

1. **Template Library:**
   - Pre-built templates for common use cases
   - Import/export template JSON
   - Community template sharing

2. **Keyboard Shortcuts:**
   - Quick record (Cmd+Shift+R)
   - Stop and save (Cmd+Shift+S)
   - Toggle pause (Cmd+Shift+P)

3. **Batch Processing:**
   - Transcribe all audio files in folder
   - Regenerate summaries with new template
   - Re-process with different AI model

4. **Enhanced File Organization:**
   - Auto-tagging based on content
   - Date-based folder structure
   - Project-based sorting

### Medium Complexity

5. **Local Transcription:**
   - Integrate Whisper.cpp (WASM build)
   - Offline transcription for privacy
   - Faster processing for short recordings

6. **Multi-Modal Input:**
   - Screen recording support
   - Image + voice notes
   - Video transcription

7. **Advanced Templates:**
   - Conditional sections (if/else logic)
   - Variable interpolation
   - Template inheritance

8. **Collaboration Features:**
   - Speaker identification with labels
   - Meeting participant auto-detection
   - Action item assignment

### High Complexity

9. **Real-Time Transcription:**
   - Streaming transcription during recording
   - Live summary updates
   - Mid-recording edits

10. **AI Workflows:**
    - Multi-stage processing (transcribe → summarize → extract tasks)
    - Custom LLM chains
    - Integration with Obsidian Dataview

11. **Cloud Sync:**
    - Optional cloud backup for recordings
    - Cross-device sync
    - Shared vault collaboration

12. **Advanced Audio Processing:**
    - Noise reduction
    - Audio enhancement
    - Background music removal
    - Speaker separation

---

## 13. Testing Strategy (Current & Recommended)

### Current Testing

**Minimal Test Coverage:**
- No unit tests for plugin code
- Manual testing during development
- Vitest configured but unused (Claude Collective tests only)

### Recommended Testing Approach

**Unit Tests (Priority: High):**
```typescript
// src/util/openAiUtils.test.ts
describe('chunkAndTranscribeWithOpenAi', () => {
  it('should split large files into chunks', () => {})
  it('should handle transcription errors gracefully', () => {})
})

// src/util/fileUtils.test.ts
describe('createNewNote', () => {
  it('should handle file name collisions', () => {})
  it('should normalize paths correctly', () => {})
})
```

**Integration Tests (Priority: Medium):**
```typescript
// test/scribe-workflow.test.ts
describe('Full scribe workflow', () => {
  it('should record → transcribe → summarize', async () => {
    // Mock AudioRecord, OpenAI client
    // Verify note creation and content
  })
})
```

**E2E Tests (Priority: Low):**
- Playwright tests for modal interactions
- Real API calls to OpenAI/AssemblyAI (expensive)
- Mobile platform testing

**Testing Utilities Needed:**
```typescript
// test/helpers/mockAudio.ts
export function createMockAudioBuffer(): ArrayBuffer

// test/helpers/mockVault.ts
export class MockVault implements Vault

// test/helpers/mockPlugin.ts
export function createTestPlugin(): ScribePlugin
```

---

## 14. Quick Reference

### Common Modification Scenarios

**Scenario 1: Add New AI Model**
1. Update `LLM_MODELS` enum in `src/util/openAiUtils.ts`
2. Add dropdown option in `src/settings/components/AiModelSettings.tsx`
3. Test with `summarizeTranscript()`

**Scenario 2: Add New Template Section**
1. Modify `DEFAULT_TEMPLATE` in `src/settings/components/NoteTemplateSettings.tsx`
2. Test Zod schema generation in `summarizeTranscript()`
3. Verify markdown rendering

**Scenario 3: Add New Command**
1. Add command in `src/commands/commands.ts`
2. Implement handler method in `src/index.ts`
3. Add to README.md

**Scenario 4: Modify Recording UI**
1. Edit `src/modal/scribeControlsModal.tsx`
2. Update state management
3. Add CSS to `src/styles.css`

**Scenario 5: Change File Naming**
1. Modify `src/util/filenameUtils.ts`
2. Update settings in `src/settings/components/FileNameSettings.tsx`
3. Test path normalization

### Environment Setup Checklist

- [ ] Node.js installed (v16+)
- [ ] `npm install` completed
- [ ] `.env` file created with `OBSIDIAN_PLUGINS_PATH`
- [ ] Obsidian test vault created
- [ ] Hot-reload plugin installed (optional)
- [ ] OpenAI API key available for testing
- [ ] AssemblyAI API key (optional)

### Build Troubleshooting

**Issue: "Cannot find module 'obsidian'"**
- Solution: Run `npm install`

**Issue: Hot-reload not working**
- Check `.env` path is correct
- Verify hot-reload plugin is enabled
- Restart Obsidian

**Issue: TypeScript errors**
- Run `npm run build:prod` to see all errors
- Check `tsconfig.json` settings
- Verify type imports from `obsidian` package

**Issue: React components not rendering**
- Check React version (19.1.0)
- Verify `jsx: "react-jsx"` in tsconfig
- Check browser console for errors

---

## 15. Conclusion

### Project Strengths

1. **Well-structured codebase** with clear separation of concerns
2. **Extensible template system** for custom use cases
3. **Multiple AI provider support** (OpenAI, AssemblyAI, custom endpoints)
4. **Mobile-friendly** with progressive failure handling
5. **React-based UI** for modern development experience
6. **Active development** with recent improvements

### Areas for Improvement

1. **Testing coverage** - Currently minimal
2. **State management** - Could be more centralized
3. **Error recovery** - Some edge cases not handled
4. **Documentation** - Code comments could be more detailed
5. **Performance** - Large file processing could be optimized

### Best Practices for Contributors

1. **Follow existing patterns** - Consistent code style
2. **Test on both platforms** - Desktop and mobile
3. **Handle errors gracefully** - Don't crash the plugin
4. **Provide user feedback** - Use Notice for all operations
5. **Document changes** - Update README and comments
6. **Version correctly** - Use `npm version` for releases

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Codebase Version:** 2.1.4
**Author:** Claude (Comprehensive Codebase Analysis)

---

This analysis provides a complete foundation for understanding and modifying the Obsidian Scribe plugin. For specific implementation questions, refer to the source files listed in each section.
