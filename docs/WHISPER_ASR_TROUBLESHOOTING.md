# Whisper-ASR Integration Troubleshooting

## Issue: Empty Transcripts Despite 200 OK Response

### Problem Analysis

From the container logs, we identified:

1. **Global environment variable conflict**: `WORD_TIMESTAMPS=true` was set globally in the stack, which can interfere with API request parameters
2. **Response structure mismatch**: Word timestamps change the response JSON structure
3. **Audio format issues**: Some requests showed "moov atom not found" errors (incomplete audio)

### Solution: Updated Stack Configuration

#### Step 1: Update Portainer Stack

1. **Open Portainer** → Navigate to your Whisper-ASR stack
2. **Click "Editor"** to edit the stack
3. **Replace with updated configuration** (see `docs/whisper-asr-stack.yml`)

**Key changes:**
- ✅ Removed `WORD_TIMESTAMPS=true` environment variable
- ✅ Added `LOG_LEVEL=DEBUG` for better diagnostics
- ✅ Added healthcheck for service monitoring

4. **Click "Update the stack"**
5. **Wait for container to restart** (should take 30-60 seconds)

#### Step 2: Verify Server Health

Test the server directly:

```bash
# Test 1: Check if server is running
curl http://127.0.0.1:9000/docs

# Test 2: Test transcription with a sample file
curl -X POST \
  -F "audio_file=@/path/to/test.webm" \
  "http://127.0.0.1:9000/asr?output=json&task=transcribe&encode=true&word_timestamps=false"
```

Expected response:
```json
{
  "text": "Your transcribed text here",
  "language": "en"
}
```

#### Step 3: Update Plugin Code

The code has been updated to explicitly set `word_timestamps=false` to prevent conflicts:

```bash
cd /mnt/d/Obsidian/johns-vault/.obsidian/plugins/obsidian-scribe
git pull
npm run build:prod
cp build/main.js main.js
cp build/styles.css styles.css
```

Restart Obsidian and test recording.

### Diagnostic Checklist

When testing, verify:

- [ ] Whisper-ASR container is running (`docker ps | grep whisper`)
- [ ] Port 9000 is accessible (`curl http://127.0.0.1:9000/docs`)
- [ ] Browser Developer Console shows no errors (F12 → Console tab)
- [ ] Network tab shows `/asr` request with 200 OK
- [ ] Response tab shows JSON with `text` field populated
- [ ] Obsidian notice shows "Transcription complete (X chars)"

### Common Issues & Solutions

#### Issue: "Model unloaded due to timeout"
**Cause**: First request after idle period takes longer
**Solution**: Normal behavior - model loads on first use (wait 10-30 seconds)

#### Issue: "moov atom not found" error
**Cause**: Audio file incomplete or corrupted
**Solution**:
- Ensure recording completes before stopping
- Try MP3 format instead of WebM in plugin settings
- Increase recording duration to ensure valid audio

#### Issue: Empty transcript with 200 OK
**Cause**: Response structure mismatch or encoding issue
**Solution**:
- Check browser Network tab → Response preview
- Verify response contains `text` field
- Check for encoding parameter conflicts

#### Issue: "ECONNREFUSED" error
**Cause**: Whisper-ASR server not running
**Solution**:
```bash
docker ps | grep whisper  # Check if running
docker logs whisper-asr-gpu  # Check for errors
docker restart whisper-asr-gpu  # Restart if needed
```

### Debug Logging

The plugin now includes detailed logging. Check browser console for:

```javascript
Whisper-ASR response: {text: "...", language: "en"}
Whisper-ASR text length: 42
```

If you see:
- `text length: 0` → Server returned empty text (check audio format)
- No logs at all → Request failing before response (check network tab)
- Error logs → Check error message for specific issue

### Performance Optimization

For best results:

1. **Model Selection**:
   - `base` = Fast, lower accuracy (good for testing)
   - `medium` = Balanced (recommended for production)
   - `large-v3` = Best accuracy, slower (high-end GPU only)

2. **Audio Settings**:
   - WebM format works best with `encode=true`
   - MP3 format may need different parameters
   - Longer recordings (>10 sec) more reliable than very short clips

3. **GPU Memory**:
   - Medium model: ~2-4GB VRAM
   - Large model: ~6-10GB VRAM
   - Monitor with `nvidia-smi`

### Testing Workflow

**Step-by-step test:**

1. Start Obsidian with Developer Console open (Ctrl+Shift+I)
2. Go to Console tab and Network tab (side by side)
3. Click recording button in Obsidian
4. Speak clearly for 5-10 seconds
5. Stop recording
6. Watch for:
   - Network tab: POST to `/asr` with 200 OK
   - Console tab: "Whisper-ASR response" log
   - Obsidian: "Transcription complete (X chars)" notice
7. If empty transcript:
   - Click the `/asr` request in Network tab
   - Go to Response tab
   - Copy the JSON and report structure

### Advanced Debugging

If issues persist, collect diagnostic data:

```bash
# 1. Check container logs (last 50 lines)
docker logs --tail 50 whisper-asr-gpu

# 2. Check GPU usage
nvidia-smi

# 3. Test with curl (simpler environment)
curl -X POST \
  -F "audio_file=@test.webm" \
  "http://127.0.0.1:9000/asr?output=text&task=transcribe&encode=true" \
  -v  # Verbose output

# 4. Check API documentation
curl http://127.0.0.1:9000/docs
```

### Next Steps

After stack update and plugin rebuild:

1. Test basic transcription (5-10 second recording)
2. Verify transcript appears in note
3. If working: Test with different recording lengths
4. If still failing: Share browser Network tab response data

### Contact & Support

If issues persist, provide:
- Browser Network tab screenshot (Response preview)
- Browser Console logs
- Docker container logs
- Stack configuration being used

This will help diagnose the specific issue with your setup.
