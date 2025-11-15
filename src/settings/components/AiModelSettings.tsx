import type ScribePlugin from 'src';
import { useState } from 'react';
import { SettingsItem } from './SettingsItem';
import { set } from 'zod';
import { TRANSCRIPT_PLATFORM, LLM_PROVIDER, CLAUDE_MODELS } from '../settings';
import { LLM_MODELS } from 'src/util/openAiUtils';
import {
  LanguageDisplayNames,
  LanguageOptions,
  type OutputLanguageOptions,
} from 'src/util/consts';
import { Notice } from 'obsidian';

export const AiModelSettings: React.FC<{
  plugin: ScribePlugin;
  saveSettings: () => void;
}> = ({ plugin, saveSettings }) => {
  const [transcriptPlatform, setTranscriptPlatform] =
    useState<TRANSCRIPT_PLATFORM>(plugin.settings.transcriptPlatform);
  const [llmModel, setLlmModel] = useState<LLM_MODELS>(
    plugin.settings.llmModel,
  );
  const [isMultiSpeakerEnabled, setIsMultiSpeakerEnabled] = useState(
    plugin.settings.isMultiSpeakerEnabled,
  );
  const [isDisableLlmTranscription, setIsDisableLlmTranscription] = useState(
    plugin.settings.isDisableLlmTranscription,
  );
  const [useCustomOpenAiBaseUrl, setUseCustomOpenAiBaseUrl] = useState(
    plugin.settings.useCustomOpenAiBaseUrl,
  );
  const [customOpenAiBaseUrl, setCustomOpenAiBaseUrl] = useState(
    plugin.settings.customOpenAiBaseUrl,
  );
  const [customTranscriptModel, setCustomTranscriptModel] = useState(
    plugin.settings.customTranscriptModel,
  );
  const [customChatModel, setCustomChatModel] = useState(
    plugin.settings.customChatModel,
  );
  const [whisperAsrBaseUrl, setWhisperAsrBaseUrl] = useState(
    plugin.settings.whisperAsrBaseUrl,
  );
  const [llmProvider, setLlmProvider] = useState<LLM_PROVIDER>(
    plugin.settings.llmProvider,
  );
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(
    plugin.settings.ollamaBaseUrl,
  );
  const [ollamaModel, setOllamaModel] = useState(
    plugin.settings.ollamaModel,
  );
  const [claudeApiKey, setClaudeApiKey] = useState(
    plugin.settings.claudeApiKey,
  );
  const [claudeModel, setClaudeModel] = useState(
    plugin.settings.claudeModel,
  );
  const [isTestingWhisperAsr, setIsTestingWhisperAsr] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);

  const handleToggleMultiSpeaker = () => {
    const value = !isMultiSpeakerEnabled;
    setIsMultiSpeakerEnabled(value);
    plugin.settings.isMultiSpeakerEnabled = value;
    saveSettings();
  };
  
  const handleToggleDisableLlmTranscription = () => {
    const value = !isDisableLlmTranscription;
    setIsDisableLlmTranscription(value);
    plugin.settings.isDisableLlmTranscription = value;
    saveSettings();
  };

  const handleToggleCustomOpenAiBaseUrl = () => {
    const value = !useCustomOpenAiBaseUrl;
    setUseCustomOpenAiBaseUrl(value);
    plugin.settings.useCustomOpenAiBaseUrl = value;
    saveSettings();
  };

  const handleCustomOpenAiBaseUrlChange = (value: string) => {
    setCustomOpenAiBaseUrl(value);
    plugin.settings.customOpenAiBaseUrl = value;
    saveSettings();
  };

  const handleCustomTranscriptModelChange = (value: string) => {
    setCustomTranscriptModel(value);
    plugin.settings.customTranscriptModel = value;
    saveSettings();
  };

  const handleCustomChatModelChange = (value: string) => {
    setCustomChatModel(value);
    plugin.settings.customChatModel = value;
    saveSettings();
  };

  const handleWhisperAsrBaseUrlChange = (value: string) => {
    setWhisperAsrBaseUrl(value);
    plugin.settings.whisperAsrBaseUrl = value;
    saveSettings();
  };

  const handleOllamaBaseUrlChange = (value: string) => {
    setOllamaBaseUrl(value);
    plugin.settings.ollamaBaseUrl = value;
    saveSettings();
  };

  const handleOllamaModelChange = (value: string) => {
    setOllamaModel(value);
    plugin.settings.ollamaModel = value;
    saveSettings();
  };

  const handleClaudeApiKeyChange = (value: string) => {
    setClaudeApiKey(value);
    plugin.settings.claudeApiKey = value;
    saveSettings();
  };

  const handleClaudeModelChange = (value: string) => {
    setClaudeModel(value);
    plugin.settings.claudeModel = value;
    saveSettings();
  };

  const testWhisperAsrConnection = async (baseUrl: string) => {
    setIsTestingWhisperAsr(true);
    try {
      const response = await fetch(`${baseUrl}/docs`);
      if (response.ok) {
        new Notice('Scribe: Connected to Whisper-ASR successfully');
        return true;
      } else {
        new Notice(`Scribe: Connection failed: HTTP ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      new Notice(`Scribe: Connection failed: ${errorMessage}`);
      return false;
    } finally {
      setIsTestingWhisperAsr(false);
    }
  };

  const testOllamaConnection = async (baseUrl: string) => {
    setIsTestingOllama(true);
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (response.ok) {
        new Notice('Scribe: Connected to Ollama successfully');
        return true;
      } else {
        new Notice(`Scribe: Connection failed: HTTP ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      new Notice(`Scribe: Connection failed: ${errorMessage}`);
      return false;
    } finally {
      setIsTestingOllama(false);
    }
  };

  return (
    <div>
      <h2>AI model options</h2>
      <SettingsItem
        name="Disable LLM transcription"
        description="If enabled, audio will not be sent to any LLM for transcription"
        control={
          <div
            className={`checkbox-container ${isDisableLlmTranscription ? 'is-enabled' : ''}`}
            onClick={(e) => {
              handleToggleDisableLlmTranscription();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleToggleDisableLlmTranscription();
              }
            }}
          >
            <input
              type="checkbox"
              checked={isDisableLlmTranscription}
              onChange={handleToggleDisableLlmTranscription}
            />
          </div>
        }
      />

      <SettingsItem
        name="Transcript platform"
        description="Your recording is uploaded to this service"
        control={
          <select
            defaultValue={transcriptPlatform}
            className="dropdown"
            onChange={(e) => {
              const value = e.target.value as TRANSCRIPT_PLATFORM;
              setTranscriptPlatform(value);
              plugin.settings.transcriptPlatform = value;
              saveSettings();
            }}
          >
            <option value={TRANSCRIPT_PLATFORM.openAi}>OpenAi</option>
            <option value={TRANSCRIPT_PLATFORM.assemblyAi}>AssemblyAI</option>
            <option value={TRANSCRIPT_PLATFORM.whisperAsr}>Whisper-ASR (Local)</option>
          </select>
        }
      />

      {transcriptPlatform === TRANSCRIPT_PLATFORM.whisperAsr && (
        <>
          <SettingsItem
            name="Whisper-ASR base URL"
            description="The base URL for your local Whisper-ASR server"
            control={
              <input
                type="text"
                placeholder="http://localhost:9000"
                value={whisperAsrBaseUrl}
                onChange={(e) => handleWhisperAsrBaseUrlChange(e.target.value)}
                className="text-input"
              />
            }
          />
          <SettingsItem
            name="Test Whisper-ASR Connection"
            description="Verify connection to your Whisper-ASR server"
            control={
              <button
                onClick={() => testWhisperAsrConnection(whisperAsrBaseUrl)}
                disabled={isTestingWhisperAsr || !whisperAsrBaseUrl}
                className="mod-cta"
              >
                {isTestingWhisperAsr ? 'Testing...' : 'Test Connection'}
              </button>
            }
          />
        </>
      )}

      {transcriptPlatform === TRANSCRIPT_PLATFORM.assemblyAi && (
        <SettingsItem
          name="Multi-speaker enabled"
          description="Enable this if you have multiple speakers in your recording"
          control={
            <div
              className={`checkbox-container ${isMultiSpeakerEnabled ? 'is-enabled' : ''}`}
              onClick={(e) => {
                handleToggleMultiSpeaker();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleToggleMultiSpeaker();
                }
              }}
            >
              <input
                type="checkbox"
                checked={isMultiSpeakerEnabled}
                onChange={handleToggleMultiSpeaker}
              />
            </div>
          }
        />
      )}

      <SettingsItem
        name="LLM model for creating the summary"
        description="The transcript is sent to this service"
        control={
          <select
            defaultValue={llmModel}
            className="dropdown"
            onChange={(e) => {
              const value = e.target.value as LLM_MODELS;
              setLlmModel(value);
              plugin.settings.llmModel = value;
              saveSettings();
            }}
          >
            {Object.keys(LLM_MODELS).map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        }
      />

      <SettingsItem
        name="Spoken language"
        description="The default spoken language for audio transcription, changing from auto may increase accuracy"
        control={
          <select
            defaultValue={plugin.settings.audioFileLanguage}
            className="dropdown"
            onChange={(e) => {
              const value = e.target.value;
              plugin.settings.audioFileLanguage = value as LanguageOptions;
              saveSettings();
            }}
          >
            {Object.keys(LanguageOptions).map((lang) => (
              <option key={lang} value={lang}>
                {LanguageDisplayNames[lang as LanguageOptions]}
              </option>
            ))}
          </select>
        }
      />

      <SettingsItem
        name="Scribe output language"
        description="The language for the notes generated by Scribe to be in"
        control={
          <select
            defaultValue={plugin.settings.scribeOutputLanguage}
            className="dropdown"
            onChange={(e) => {
              const value = e.target.value;
              plugin.settings.scribeOutputLanguage =
                value as OutputLanguageOptions;
              saveSettings();
            }}
          >
            {Object.keys(LanguageOptions)
              .filter((lang) => lang !== LanguageOptions.auto) // Remove auto
              .map((lang) => (
                <option key={lang} value={lang}>
                  {LanguageDisplayNames[lang as LanguageOptions]}
                </option>
              ))}
          </select>
        }
      />

      <h3>LLM Provider</h3>
      <SettingsItem
        name="LLM Provider"
        description="Choose the provider for summarization and chat functionality"
        control={
          <select
            defaultValue={llmProvider}
            className="dropdown"
            onChange={(e) => {
              const value = e.target.value as LLM_PROVIDER;
              setLlmProvider(value);
              plugin.settings.llmProvider = value;
              saveSettings();
            }}
          >
            <option value={LLM_PROVIDER.openai}>OpenAI</option>
            <option value={LLM_PROVIDER.ollama}>Ollama (Local)</option>
            <option value={LLM_PROVIDER.claude}>Claude (Anthropic)</option>
          </select>
        }
      />

      {llmProvider === LLM_PROVIDER.ollama && (
        <>
          <SettingsItem
            name="Ollama base URL"
            description="The base URL for your local Ollama server"
            control={
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={ollamaBaseUrl}
                onChange={(e) => handleOllamaBaseUrlChange(e.target.value)}
                className="text-input"
              />
            }
          />
          <SettingsItem
            name="Test Ollama Connection"
            description="Verify connection to your Ollama server"
            control={
              <button
                onClick={() => testOllamaConnection(ollamaBaseUrl)}
                disabled={isTestingOllama || !ollamaBaseUrl}
                className="mod-cta"
              >
                {isTestingOllama ? 'Testing...' : 'Test Connection'}
              </button>
            }
          />

          <SettingsItem
            name="Ollama model"
            description="The Ollama model to use for summarization (e.g., llama3.1:8b, mistral, etc.)"
            control={
              <input
                type="text"
                placeholder="llama3.1:8b"
                value={ollamaModel}
                onChange={(e) => handleOllamaModelChange(e.target.value)}
                className="text-input"
              />
            }
          />
        </>
      )}

      {llmProvider === LLM_PROVIDER.claude && (
        <>
          <SettingsItem
            name="Claude API key"
            description="Enter your Claude Subscription API key from https://console.anthropic.com/"
            control={
              <input
                type="password"
                placeholder="sk-ant-..."
                value={claudeApiKey}
                onChange={(e) => handleClaudeApiKeyChange(e.target.value)}
                className="text-input"
              />
            }
          />

          <SettingsItem
            name="Claude model"
            description="Choose the Claude model for summarization (Sonnet recommended)"
            control={
              <select
                defaultValue={claudeModel}
                className="dropdown"
                onChange={(e) => handleClaudeModelChange(e.target.value)}
              >
                {Object.entries(CLAUDE_MODELS).map(([displayName, apiId]) => (
                  <option key={apiId} value={apiId}>
                    {displayName}
                  </option>
                ))}
              </select>
            }
          />
        </>
      )}

      <h3>Custom OpenAI Configuration</h3>
      <SettingsItem
        name="Use custom OpenAI base URL"
        description="Enable this to use a custom OpenAI-compatible API endpoint (e.g., local LLM server, Azure OpenAI, etc.)"
        control={
          <div
            className={`checkbox-container ${useCustomOpenAiBaseUrl ? 'is-enabled' : ''}`}
            onClick={(e) => {
              handleToggleCustomOpenAiBaseUrl();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleToggleCustomOpenAiBaseUrl();
              }
            }}
          >
            <input
              type="checkbox"
              checked={useCustomOpenAiBaseUrl}
              onChange={handleToggleCustomOpenAiBaseUrl}
            />
          </div>
        }
      />

      {useCustomOpenAiBaseUrl && (
        <>
          <SettingsItem
            name="Custom OpenAI base URL"
            description="The base URL for your custom OpenAI-compatible API (e.g., http://localhost:1234/v1, https://your-instance.openai.azure.com/)"
            control={
              <input
                type="text"
                placeholder="http://localhost:1234/v1"
                value={customOpenAiBaseUrl}
                onChange={(e) => handleCustomOpenAiBaseUrlChange(e.target.value)}
                className="text-input"
              />
            }
          />

          <SettingsItem
            name="Custom transcription model"
            description="The model name to use for audio transcription (e.g., whisper-1, faster-whisper, etc.)"
            control={
              <input
                type="text"
                placeholder="whisper-1"
                value={customTranscriptModel}
                onChange={(e) => handleCustomTranscriptModelChange(e.target.value)}
                className="text-input"
              />
            }
          />

          <SettingsItem
            name="Custom chat model"
            description="The model name to use for chat/summarization (e.g., gpt-4, llama-3.1-8b-instruct, etc.)"
            control={
              <input
                type="text"
                placeholder="gpt-4o"
                value={customChatModel}
                onChange={(e) => handleCustomChatModelChange(e.target.value)}
                className="text-input"
              />
            }
          />
        </>
      )}
    </div>
  );
};
