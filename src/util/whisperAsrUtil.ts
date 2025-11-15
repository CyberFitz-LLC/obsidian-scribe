import { Notice } from 'obsidian';
import type { ScribeOptions } from 'src';
import { LanguageOptions } from './consts';

/**
 * Response structure from Whisper-ASR API
 * Documented at: https://github.com/ahmetoner/whisper-asr-webservice
 */
interface WhisperAsrResponse {
  text: string;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  language: string;
}

/**
 * Transcribe audio using a locally-hosted Whisper-ASR server
 *
 * @param baseUrl - The base URL of the Whisper-ASR server (e.g., http://localhost:9000)
 * @param audioBuffer - The audio data as ArrayBuffer
 * @param options - Transcription options including language preference
 * @returns The transcribed text
 *
 * @example
 * ```typescript
 * const transcript = await transcribeAudioWithWhisperAsr(
 *   'http://localhost:9000',
 *   audioBuffer,
 *   { audioFileLanguage: LanguageOptions.en }
 * );
 * ```
 */
export async function transcribeAudioWithWhisperAsr(
  baseUrl: string,
  audioBuffer: ArrayBuffer,
  options: Pick<ScribeOptions, 'audioFileLanguage'>,
): Promise<string> {
  const { audioFileLanguage } = options || {};

  try {
    new Notice('Scribe: Sending audio to Whisper-ASR...');

    // Create FormData with audio blob
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('audio_file', audioBlob, 'recording.webm');

    // Build query parameters
    const params = new URLSearchParams({
      output: 'json',
      task: 'transcribe',
      encode: 'true',
    });

    // Add language parameter if specified (not auto-detect)
    const useAudioFileLanguageSetting =
      audioFileLanguage && audioFileLanguage !== LanguageOptions.auto;

    if (useAudioFileLanguageSetting) {
      params.append('language', audioFileLanguage);
    }

    // Make request to Whisper-ASR server
    const url = `${baseUrl}/asr?${params.toString()}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // Handle errors with helpful messages
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Whisper-ASR request failed: ${response.status} - ${errorText}`;

      new Notice(`Scribe: ${errorMessage}`);
      console.error('Whisper-ASR transcription error:', errorMessage);

      throw new Error(errorMessage);
    }

    // Parse response and extract text
    const result: WhisperAsrResponse = await response.json();

    new Notice('Scribe: Transcription complete');

    return result.text;

  } catch (error) {
    // Provide helpful error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if error is likely due to server not being reachable
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      const helpMessage =
        'Whisper-ASR server not found. Is Docker running?\n\n' +
        'To start the server, run:\n' +
        'docker run -d -p 9000:9000 onerahmet/openai-whisper-asr-webservice:latest';

      new Notice(`Scribe: ${helpMessage}`, 10000);
      console.error('Whisper-ASR connection error:', helpMessage);

      throw new Error(helpMessage);
    }

    // Generic error handling
    new Notice(`Scribe: Whisper-ASR transcription failed - ${errorMessage}`);
    console.error('Whisper-ASR transcription error:', error);

    throw error;
  }
}

/**
 * Transcribe audio with speaker diarization using WhisperX
 *
 * NOTE: This is an optional enhancement for future implementation.
 * Requires WhisperX to be installed in the Docker container.
 *
 * @param baseUrl - The base URL of the Whisper-ASR server
 * @param audioBuffer - The audio data as ArrayBuffer
 * @param minSpeakers - Minimum number of speakers (optional)
 * @param maxSpeakers - Maximum number of speakers (optional)
 * @returns The transcribed text with speaker labels
 */
export async function transcribeWithDiarization(
  baseUrl: string,
  audioBuffer: ArrayBuffer,
  minSpeakers?: number,
  maxSpeakers?: number,
): Promise<string> {
  try {
    new Notice('Scribe: Sending audio to Whisper-ASR with speaker diarization...');

    // Create FormData with audio blob
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('audio_file', audioBlob, 'recording.webm');

    // Build query parameters for diarization
    const params = new URLSearchParams({
      output: 'json',
      task: 'transcribe',
      encode: 'true',
      word_timestamps: 'true',
      diarize: 'true',
    });

    // Add speaker count parameters if specified
    if (minSpeakers !== undefined) {
      params.append('min_speakers', minSpeakers.toString());
    }
    if (maxSpeakers !== undefined) {
      params.append('max_speakers', maxSpeakers.toString());
    }

    // Make request to Whisper-ASR server
    const url = `${baseUrl}/asr?${params.toString()}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper-ASR diarization failed: ${response.status} - ${errorText}`);
    }

    const result: WhisperAsrResponse = await response.json();

    new Notice('Scribe: Diarization complete');

    return result.text;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    new Notice(`Scribe: Whisper-ASR diarization failed - ${errorMessage}`);
    console.error('Whisper-ASR diarization error:', error);
    throw error;
  }
}
