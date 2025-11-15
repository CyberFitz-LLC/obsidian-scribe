# Scribe for Obsidian 🎙️

Transform your voice into insights with Scribe, an Obsidian plugin that not only records your voice and transcribes it, but summarizes, and enriches the note with the power of AI. 

Dive into a seamless experience where your spoken words are effortlessly converted into a structured, easy-to-navigate knowledge base.

Forgot a phrase or concept while recording?  Ask "Hey Scribe" followed by a question in the middle of recording and it will fill in the blanks for you

## Local AI Support

Run Scribe completely locally with no cloud dependencies for **complete privacy** and **zero API costs**:

- **Local Transcription**: Use Whisper-ASR to transcribe voice locally via Docker
- **Local LLM**: Use Ollama to generate summaries entirely on your machine
- **Offline Operation**: Record, transcribe, and summarize without internet connection
- **Privacy First**: Your voice notes never leave your computer

**Benefits:**
- No API keys required
- No usage limits or costs
- Complete data sovereignty
- Works offline

**See the [Local Setup Guide](docs/LOCAL_SETUP.md) for complete installation instructions.**

## Screenshots
![obsidian-scribe-screenshots](https://github.com/user-attachments/assets/79eb4427-799a-47ba-8024-4d1350ac47cf)

## 🌟 Key Features
- **Voice-to-Text Magic:** Begin recording and watch as your voice notes are transcribed, summarized, and turned into actionable insights.
- **Multiple LLM Providers:** Choose between OpenAI, Claude (Anthropic), or Ollama (Local) for AI-powered summarization - use cloud services for quality or run completely offline with Ollama.
- **Robust on Failure:** Designed with mobile users in mind, Scribe ensures that no step in the process is a single point of failure. Record, transcribe, and summarize on the go, with each step saved progressively. (WIP)
- **Seamless Integration:** Utilizes AssemblyAI, OpenAI Whisper, or local Whisper-ASR for top-tier transcription accuracy.
- **Create your custom templates:** Harness the language models and insert your own custom prompts as template!
- **Multi Language Support:** Select your language and go wild!
- **Interactive Queries:** Ask questions mid-recording, and Scribe fetches the answers, integrating them directly into your notes.
- **Mermaid Chart Creation:** Visualize your thoughts and summaries with automatically generated Mermaid charts, providing a unique perspective on your notes.
## 🕹️ Commands
### From the Ribbon button
- Either Click Start Recording or Open the Controls Modal
### From the Command Pallette type "Scribe"
- **Begin Recording with Scribe:** - Opens the controls modal for you to begin recording
- **Select and transcribe audio file:** - Choose an existing audio file from your vault to transcribe and summarize
- **Transcribe & Summarize Current File:** - Run this on an open audio file - it will Scribe this file.  Very useful for recording offline and later Scribing it
- **Fix Mermaid Chart:** - Sometimes the generated Mermaid Chart is invalid, this will attempt to fix it.

## ⚙️ Settings / Configuration

### LLM Provider Configuration

Scribe supports three LLM providers for AI-powered summarization. Choose the one that best fits your needs:

#### OpenAI (Cloud)

OpenAI provides high-quality summarization with industry-leading models.

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Scribe settings:
   - Select "OpenAI" as LLM Provider
   - Enter your OpenAI API key (starts with `sk-...`)
   - Choose model:
     - **GPT-4o** (Recommended): Best balance of quality, speed, and cost
     - **GPT-4o-mini**: Faster, lower cost option
     - **GPT-4.1**: Latest flagship model for complex summaries
     - **GPT-4.1-mini**: Efficient mini version of latest model
     - **GPT-4-turbo**: Previous generation flagship

**Pricing**: See [OpenAI Pricing](https://openai.com/pricing)

#### Claude (Anthropic) (Cloud)

Claude provides high-quality summarization with subscription access.

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. In Scribe settings:
   - Select "Claude (Anthropic)" as LLM Provider
   - Enter your Claude API key (starts with `sk-ant-...`)
   - Choose model:
     - **Claude Sonnet 4.5** (Recommended): Best balance of quality, speed, and cost
     - **Claude Haiku 4.5**: Faster, lower cost option
     - **Claude Opus 4.1**: Maximum quality for complex summaries

**Pricing**: See [Anthropic Pricing](https://www.anthropic.com/pricing)

#### Ollama (Local)

Run summarization completely locally with Ollama - no API keys required, complete privacy, works offline.

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.1:8b` or `ollama pull qwen2.5:7b`
3. In Scribe settings:
   - Select "Ollama (Local)" as LLM Provider
   - Set Base URL (default: `http://localhost:11434`)
   - Enter model name (e.g., `llama3.1:8b`, `qwen2.5:7b`, `mistral:7b`)

**Benefits**: Complete privacy, no API costs, works offline
**Note**: Requires adequate CPU/GPU for best performance. Quality may vary by model.

### Transcription Configuration

Choose your preferred transcription service:

- **OpenAI Whisper (Default):** High-quality transcription using OpenAI's Whisper model. Requires OpenAI API key.

- **AssemblyAI (Optional):** For enhanced transcription accuracy and speaker diarization. Enjoy a $50 credit from AssemblyAI to get started.
  - Get your key from [AssemblyAI Console](https://www.assemblyai.com/app/account)

- **Whisper-ASR (Local):** Run transcription locally with Whisper-ASR server for complete privacy.
  - Set base URL to your Whisper-ASR instance (e.g., `http://localhost:9000`)

### Other Settings

- **Audio Input Device:** Select which microphone to use for recording. By default, the system's default audio input device will be used.

- **Audio File Format:** Choose between WebM and MP3 formats for saving audio recordings. MP3 format will be converted from WebM on the client side.

- **Disable LLM Transcription:** If enabled, audio will not be sent to any LLM for transcription, providing privacy when needed.

## 🚀 Getting Started

### Installation

1. In Obsidian, navigate to `Settings` > `Community Plugins`.
2. Search for `Scribe` and click `Install`.
3. Once installed, toggle `Enable` to activate Scribe.

## 📖 How to Use

### Recording New Audio

1. **Start Recording:** Trigger the Scribe action or select it from the ribbon and begin recording
2. **Interactive Queries:** Pose questions during recording to have them answered and integrated into your notes just say "Hey Scribe" followed by the question.
3. **Review and Explore:** Access the transcribed text, summary, insights, and Mermaid charts directly in your note.

### Processing Existing Audio Files

You can reprocess existing audio recordings using Scribe:

1. Open Command Palette (Ctrl/Cmd+P)
2. Type "Select and transcribe audio file"
3. Select an audio file from the picker
4. Wait for transcription and summarization to complete

**Supported Audio Formats:**
- WebM (.webm)
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)
- FLAC (.flac)

**Note:** Files are processed using your configured transcription service (Whisper-ASR, OpenAI Whisper, or AssemblyAI) and LLM provider (OpenAI, Claude, or Ollama).

## 📱 Mobile

Scribe shines in mobile scenarios, gracefully handling interruptions or connectivity issues. If any step fails, simply resume without losing any progress.
This is a WIP, you will never lose your audio, but it will regenerate the note, transcription and summary

### Known Issues
1. On iOS, the screen must be **ON** while recording otherwise it won't capture youre voice.  This is a limitation of Obsidian.

## 🛠 How to Contribute

Your insights, improvements, and feedback are what make Scribe better. Feel free to submit issues, pull requests, or suggestions to enhance the plugin further.

## 🙏 Acknowledgments

An deep bow, acknowledgement and gratitude to the innumerable nameless Humans from Colombia to the Phillipines to Kenya and beyond who used their intelligence and human hearts to help train what we are calling artificial intelligence.

https://www.noemamag.com/the-exploited-labor-behind-artificial-intelligence/
https://www.wired.com/story/millions-of-workers-are-training-ai-models-for-pennies/


A special thanks to [Drew Mcdonald of the Magic Mic Plugin](https://github.com/drewmcdonald/obsidian-magic-mic), this was super useful for learning how to access & use the audio buffers
Also a special thanks to [Mossy1022 of the Smart Memos Plugin](https://github.com/Mossy1022/Smart-Memos) including Mermaid Charts is SO useful, and I got that idea from your plugin.

## 🔒 License

Scribe is released under the MIT License. Feel free to use, modify, and distribute it as you see fit.

## 📬 Contact

Got questions, feedback, or ideas? Reach out through [GitHub Issues](#) or join our Discord channel to become part of the Scribe community.

## 🔧 Troubleshooting

### OpenAI Issues

- **401 Unauthorized**: Check your API key is correct and active at [OpenAI Platform](https://platform.openai.com/api-keys)
- **429 Rate Limit**: You've exceeded your rate limit or quota. Check your usage and billing at [OpenAI Usage](https://platform.openai.com/usage)
- **Insufficient Credits**: Add credits to your OpenAI account at [Billing](https://platform.openai.com/settings/organization/billing)

### Claude (Anthropic) Issues

- **401 Unauthorized**: Check your API key is correct and active at [Anthropic Console](https://console.anthropic.com/)
- **429 Rate Limit**: You've exceeded your rate limit. Wait and try again, or check your plan limits
- **500 Server Error**: Anthropic service issue. Check [Anthropic Status](https://status.anthropic.com/) and try again later

### Ollama Issues

- **Connection Failed**: Verify Ollama is running with `ollama list` in terminal
- **Model Not Found**: Ensure the model is downloaded with `ollama pull <model-name>`
- **Base URL Incorrect**: Default is `http://localhost:11434` - verify Ollama is running on this port
- **Slow Performance**: Ollama requires adequate CPU/GPU. Consider using smaller models (7b/8b) or upgrading hardware
- **Quality Issues**: Try different models - qwen2.5:7b and llama3.1:8b typically provide best quality for summarization

### Transcription Issues

- **Whisper-ASR Connection**: Verify your Whisper-ASR server is running and the base URL is correct
- **AssemblyAI Errors**: Check your API key and account credits at [AssemblyAI Console](https://www.assemblyai.com/app/account)

## ❓ FAQ

**Q: Which LLM provider should I choose?**
A:
- **OpenAI**: Best overall quality and reliability with GPT-4o models
- **Claude**: Excellent quality with strong performance on complex reasoning tasks
- **Ollama**: Best for privacy-conscious users who want to run completely offline without API costs

**Q: Do I need API keys?**
A: It depends on your provider choice:
- **OpenAI** or **Claude**: Yes, you need an API key from the respective provider
- **Ollama**: No API key needed - runs completely locally
- **Transcription**: OpenAI Whisper or AssemblyAI requires API keys, but Whisper-ASR can run locally

**Q: Can I use Scribe completely offline?**
A: Yes! Use Ollama for summarization and Whisper-ASR for transcription to run Scribe entirely offline with complete privacy. You can record offline and later use the "Transcribe & Summarize Current File" command on the audio file.

**Q: Which models are recommended?**
A:
- **OpenAI**: GPT-4o (best balance) or GPT-4o-mini (faster/cheaper)
- **Claude**: Claude Sonnet 4.5 (best balance) or Claude Haiku 4.5 (faster/cheaper)
- **Ollama**: llama3.1:8b or qwen2.5:7b for good quality on consumer hardware

---

Dive into a new era of note-taking with Scribe – Where your voice breathes life into ideas. 🌈✨
