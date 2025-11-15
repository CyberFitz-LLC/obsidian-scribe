# Local AI Setup Guide

Run Scribe for Obsidian completely locally with no cloud dependencies, ensuring complete privacy and eliminating API costs.

## Table of Contents

- [Overview](#overview)
- [Whisper-ASR Setup (Local Transcription)](#whisper-asr-setup-local-transcription)
- [Ollama Setup (Local LLM)](#ollama-setup-local-llm)
- [Fully Local Setup](#fully-local-setup)
- [Troubleshooting](#troubleshooting)

## Overview

Scribe supports running entirely on your local machine using:

- **Whisper-ASR** for voice transcription (replaces OpenAI Whisper or AssemblyAI)
- **Ollama** for AI summarization (replaces OpenAI GPT or Claude)

**Benefits:**
- Complete privacy - no data sent to the cloud
- No API costs - run unlimited transcriptions and summaries
- Offline operation - works without internet connection
- Data sovereignty - all your voice notes stay on your machine

**Requirements:**
- Docker Desktop (for Whisper-ASR)
- 8GB+ RAM recommended
- 10GB+ free disk space
- GPU optional but recommended for better performance

---

## Whisper-ASR Setup (Local Transcription)

Whisper-ASR runs OpenAI's Whisper model locally using Docker containers.

### Prerequisites

1. **Install Docker Desktop**
   - **macOS/Windows**: Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - **Linux**: Follow [official Docker installation guide](https://docs.docker.com/engine/install/)

2. **Verify Docker Installation**
   ```bash
   docker --version
   # Should output: Docker version 20.x.x or higher
   ```

### CPU-Only Setup (Basic)

Best for users without dedicated GPU or testing the service.

```bash
docker run -d \
  -p 9000:9000 \
  -e ASR_MODEL=base \
  onerahmet/openai-whisper-asr-webservice:latest
```

**Parameters:**
- `-d`: Run in background (detached mode)
- `-p 9000:9000`: Map port 9000 for API access
- `-e ASR_MODEL=base`: Use base model (see Model Selection below)

### GPU Setup (Recommended)

Significantly faster transcription with NVIDIA GPU.

**Prerequisites:**
- NVIDIA GPU with CUDA support
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) installed

**Using Docker Command:**
```bash
docker run -d \
  --gpus all \
  --shm-size=4g \
  -p 9000:9000 \
  -e ASR_ENGINE=faster_whisper \
  -e ASR_MODEL=medium \
  -e ASR_DEVICE=cuda \
  onerahmet/openai-whisper-asr-webservice:latest-gpu
```

**Using Docker Compose (Recommended for GPU):**

Create a file named `docker-compose.yml`:

```yaml
version: '3.8'

services:
  whisper-asr-gpu:
    image: onerahmet/openai-whisper-asr-webservice:latest-gpu
    container_name: whisper-asr-gpu
    runtime: nvidia
    ports:
      - "9000:9000"
    environment:
      - ASR_ENGINE=faster_whisper
      - ASR_MODEL=medium
      - ASR_DEVICE=cuda
    volumes:
      - ./whisper-gpu-cache:/root/.cache
    restart: unless-stopped
```

Start the container:
```bash
docker-compose up -d
```

**GPU Parameters:**
- `--gpus all`: Use all available GPUs
- `--shm-size=4g`: Allocate 4GB shared memory (prevents memory errors)
- `ASR_ENGINE=faster_whisper`: Use optimized faster-whisper engine
- `ASR_DEVICE=cuda`: Enable GPU acceleration

### Model Selection Guide

Choose a model based on your hardware and accuracy requirements:

| Model    | Size   | Memory | Speed      | Accuracy | Best For                    |
|----------|--------|--------|------------|----------|-----------------------------|
| `tiny`   | ~75MB  | ~1GB   | Very Fast  | Basic    | Quick tests, low-end systems |
| `base`   | ~150MB | ~1GB   | Fast       | Good     | Default, balanced option     |
| `small`  | ~500MB | ~2GB   | Medium     | Better   | CPU users, good balance      |
| `medium` | ~1.5GB | ~5GB   | Slower     | High     | GPU users, high quality      |
| `large`  | ~3GB   | ~10GB  | Slowest    | Highest  | GPU only, maximum accuracy   |

**Recommendations:**
- **CPU only**: Use `base` or `small`
- **GPU available**: Use `medium` or `large`
- **Testing**: Start with `base` and upgrade if needed

### Verify Installation

Test the service is running:

```bash
# Check if container is running
docker ps | grep whisper

# Test API endpoint
curl http://localhost:9000/
# Should return: {"message":"Whisper ASR Webservice"}
```

### Configure Scribe Plugin

1. Open Obsidian Settings > Scribe
2. Under **Transcription Configuration**:
   - Set **Transcription Provider** to: `Whisper-ASR`
   - Set **Whisper-ASR Base URL** to: `http://127.0.0.1:9000`
3. Save settings

### Container Management

**Start the container:**
```bash
docker start whisper-asr-gpu
```

**Stop the container:**
```bash
docker stop whisper-asr-gpu
```

**View logs:**
```bash
docker logs whisper-asr-gpu
```

**Remove container:**
```bash
docker rm -f whisper-asr-gpu
```

---

## Ollama Setup (Local LLM)

Ollama runs large language models locally for AI summarization.

### Installation

#### macOS
```bash
brew install ollama
```

Or download installer from [ollama.ai](https://ollama.ai)

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download the installer from [ollama.ai](https://ollama.ai)

### Start Ollama Server

```bash
ollama serve
```

The server will start on `http://localhost:11434`

**Note**: On macOS/Windows with the desktop app, the server starts automatically.

### Pull Recommended Models

Download models to use for summarization:

```bash
# Recommended: Best balance of quality and speed (8B parameters)
ollama pull llama3.1:8b

# Alternative: Good quality, efficient (7B parameters)
ollama pull qwen2.5:7b

# Alternative: Fast and lightweight (7B parameters)
ollama pull mistral:7b
```

**First download will take several minutes (4-6GB per model).**

### Model Recommendations

| Model         | Size  | RAM Required | Quality | Speed      | Best For                    |
|---------------|-------|--------------|---------|------------|-----------------------------|
| llama3.1:8b   | 4.7GB | 8GB          | High    | Medium     | **Recommended** - best overall |
| qwen2.5:7b    | 4.4GB | 8GB          | High    | Medium     | Alternative, strong reasoning |
| mistral:7b    | 4.1GB | 8GB          | Good    | Fast       | Speed priority              |
| llama3.1:70b  | 40GB  | 64GB         | Highest | Slow       | Workstation/server only     |

**Recommendation**: Start with `llama3.1:8b` for the best balance of quality and performance on consumer hardware.

### Verify Installation

```bash
# List installed models
ollama list

# Test model (should generate a response)
ollama run llama3.1:8b "Hello, how are you?"
```

### Configure Scribe Plugin

1. Open Obsidian Settings > Scribe
2. Under **LLM Provider Configuration**:
   - Set **LLM Provider** to: `Ollama (Local)`
   - Set **Base URL** to: `http://localhost:11434`
   - Set **Model Name** to: `llama3.1:8b` (or your chosen model)
3. Save settings

### Ollama Management

**Update Ollama:**
```bash
# macOS
brew upgrade ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

**List models:**
```bash
ollama list
```

**Remove a model:**
```bash
ollama rm llama3.1:8b
```

**Check server status:**
```bash
curl http://localhost:11434/api/version
```

---

## Fully Local Setup

Run Scribe completely offline with no cloud dependencies.

### Complete Configuration

1. **Start Whisper-ASR** (choose one):
   ```bash
   # CPU
   docker run -d -p 9000:9000 -e ASR_MODEL=base \
     onerahmet/openai-whisper-asr-webservice:latest

   # GPU
   docker run -d --gpus all --shm-size=4g -p 9000:9000 \
     -e ASR_ENGINE=faster_whisper -e ASR_MODEL=medium -e ASR_DEVICE=cuda \
     onerahmet/openai-whisper-asr-webservice:latest-gpu
   ```

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **Pull a model** (if not already done):
   ```bash
   ollama pull llama3.1:8b
   ```

4. **Configure Scribe**:
   - Transcription Provider: `Whisper-ASR`
   - Whisper-ASR Base URL: `http://127.0.0.1:9000`
   - LLM Provider: `Ollama (Local)`
   - Ollama Base URL: `http://localhost:11434`
   - Ollama Model: `llama3.1:8b`

### Privacy-Focused Workflow

**Your data never leaves your machine:**
1. Voice is recorded locally in Obsidian
2. Audio sent to Whisper-ASR running on `localhost`
3. Transcription sent to Ollama running on `localhost`
4. Summary saved in your local Obsidian vault

**No external connections required** - you can disconnect from the internet and Scribe will continue to work.

### Verify Offline Operation

1. **Test Whisper-ASR**:
   ```bash
   curl http://127.0.0.1:9000/
   # Should return: {"message":"Whisper ASR Webservice"}
   ```

2. **Test Ollama**:
   ```bash
   curl http://localhost:11434/api/version
   # Should return version information
   ```

3. **Test in Scribe**:
   - Record a short voice note
   - Verify transcription completes
   - Verify summary generates
   - Check Obsidian vault for saved note

### Performance Expectations

**Transcription Speed (1 minute of audio):**
- CPU (base model): ~30-60 seconds
- CPU (small model): ~60-120 seconds
- GPU (medium model): ~5-10 seconds
- GPU (large model): ~10-20 seconds

**Summary Generation:**
- llama3.1:8b: ~5-15 seconds for typical note
- Response time depends on CPU/GPU power

**Quality Comparison:**
- **Transcription**: Whisper-ASR medium/large models match OpenAI Whisper quality
- **Summaries**: llama3.1:8b produces good quality summaries, though cloud models (GPT-4o, Claude) may have slight edge on complex content

---

## Troubleshooting

### Whisper-ASR Issues

#### Connection Refused / Cannot Connect
```
Error: Failed to connect to Whisper-ASR
```

**Solutions:**
1. Verify container is running:
   ```bash
   docker ps | grep whisper
   ```
2. Check container logs:
   ```bash
   docker logs whisper-asr-gpu
   ```
3. Test endpoint manually:
   ```bash
   curl http://127.0.0.1:9000/
   ```
4. Verify correct base URL in Scribe settings: `http://127.0.0.1:9000`

#### CUDA Out of Memory (GPU)
```
Error: CUDA out of memory
```

**Solutions:**
1. **Reduce model size**: Switch from `large` → `medium` → `small`
2. **Increase shared memory**:
   ```bash
   docker run --shm-size=8g ...  # Increase from 4g to 8g
   ```
3. **Close other GPU applications** (games, video editing, etc.)
4. **Fall back to CPU**: Remove `--gpus all` and `ASR_DEVICE=cuda`

#### 413 Request Entity Too Large
```
Error: 413 Payload Too Large
```

**Solutions:**
1. **Long audio files**: Try splitting recordings into shorter segments
2. **Configure nginx** (if using reverse proxy) to allow larger payloads
3. **Use smaller audio format**: Convert to MP3 with lower bitrate

#### Model Download Slow/Stuck
**Solution:**
1. Check internet connection
2. First run downloads the model (~150MB to 3GB) - be patient
3. Check container logs to see download progress:
   ```bash
   docker logs -f whisper-asr-gpu
   ```

### Ollama Issues

#### Connection Failed
```
Error: Failed to connect to Ollama
```

**Solutions:**
1. Verify Ollama is running:
   ```bash
   ollama list
   ```
2. Check server is running:
   ```bash
   curl http://localhost:11434/api/version
   ```
3. Start server manually:
   ```bash
   ollama serve
   ```
4. Verify base URL in Scribe: `http://localhost:11434`

#### Model Not Found
```
Error: model 'llama3.1:8b' not found
```

**Solutions:**
1. Pull the model first:
   ```bash
   ollama pull llama3.1:8b
   ```
2. List available models:
   ```bash
   ollama list
   ```
3. Use exact model name in Scribe settings (case-sensitive)

#### Slow Performance
```
Summaries taking too long to generate
```

**Solutions:**
1. **Use smaller model**: Try `mistral:7b` instead of `llama3.1:8b`
2. **Check RAM usage**: Ensure sufficient free memory (8GB+ recommended)
3. **Close other applications**: Free up system resources
4. **GPU acceleration**: If available, Ollama will automatically use GPU (verify with `ollama run llama3.1:8b "test"`)
5. **Upgrade hardware**: Consider more RAM or dedicated GPU

#### Quality Issues
```
Summaries are inaccurate or low quality
```

**Solutions:**
1. **Try better models**:
   ```bash
   ollama pull llama3.1:8b    # Generally best balance
   ollama pull qwen2.5:7b     # Strong alternative
   ```
2. **Adjust prompts**: Customize templates in Scribe settings
3. **Accept tradeoff**: Local models won't match cloud GPT-4o/Claude quality, but provide privacy and cost benefits
4. **Workstation only**: Pull larger model like `llama3.1:70b` (requires 64GB+ RAM)

### General Issues

#### Both Services Running but Scribe Fails
1. **Check Obsidian console**:
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
   - Look for errors in Console tab
2. **Verify URLs**: Ensure no typos in base URLs
3. **Test each service independently** (see Verify sections above)
4. **Restart Obsidian** after configuration changes

#### Firewall/Network Issues
1. **Allow local connections**: Ensure firewall allows localhost connections
2. **Check port availability**:
   ```bash
   # Check if ports are in use
   lsof -i :9000   # Whisper-ASR
   lsof -i :11434  # Ollama
   ```
3. **Use alternative ports** if needed:
   ```bash
   # Whisper-ASR on different port
   docker run -d -p 9001:9000 ...
   # Update Scribe to: http://127.0.0.1:9001
   ```

#### Performance Comparison: Local vs Cloud

**When to use local:**
- Privacy is critical
- No API budget
- Offline operation needed
- Short recordings (1-5 minutes)

**When to use cloud:**
- Maximum quality needed
- Long recordings (30+ minutes)
- Minimal local resources
- Willing to pay for convenience

---

## Additional Resources

- [Whisper-ASR GitHub](https://github.com/ahmetoner/whisper-asr-webservice)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Docker Documentation](https://docs.docker.com/)
- [Scribe Troubleshooting Guide](./WHISPER_ASR_TROUBLESHOOTING.md)

## Support

For issues specific to:
- **Scribe Plugin**: [GitHub Issues](https://github.com/tazmon95/obsidian-scribe/issues)
- **Whisper-ASR**: [Whisper-ASR Issues](https://github.com/ahmetoner/whisper-asr-webservice/issues)
- **Ollama**: [Ollama Issues](https://github.com/ollama/ollama/issues)

---

**Enjoy complete privacy and control over your voice notes with fully local AI!**
