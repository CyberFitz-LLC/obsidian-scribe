/**
 * Claude utility functions for LLM-based summarization
 * Mirrors the OpenAI implementation but uses Anthropic's Claude models
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from 'zod';
import { HumanMessage } from '@langchain/core/messages';
import type { ScribeOptions } from 'src';
import { convertToSafeJsonKey } from './textUtil';

export async function summarizeTranscriptWithClaude(
  apiKey: string,
  model: string,
  transcript: string,
  { scribeOutputLanguage, activeNoteTemplate }: ScribeOptions,
) {
  const systemPrompt = `
  You are "Scribe" an expert note-making AI for Obsidian you specialize in the Linking Your Thinking (LYK) strategy.
  The following is the transcription generated from a recording of someone talking aloud or multiple people in a conversation.
  There may be a lot of random things said given fluidity of conversation or thought process and the microphone's ability to pick up all audio.

  The transcription may address you by calling you "Scribe" or saying "Hey Scribe" and asking you a question, they also may just allude to you by asking "you" to do something.
  Give them the answers to this question

  Give me notes in Markdown language on what was said, they should be
  - Easy to understand
  - Succinct
  - Clean
  - Logical
  - Insightful

  It will be nested under a h2 # tag, feel free to nest headers underneath it
  Rules:
  - Do not include escaped new line characters
  - Do not mention "the speaker" anywhere in your response.
  - The notes should be written as if I were writing them.

  The following is the transcribed audio:
  <transcript>
  ${transcript}
  </transcript>
  `;

  try {
    // Create ChatAnthropic instance with temperature 0.5 (matches OpenAI for consistency)
    const llm = new ChatAnthropic({
      model: model,
      apiKey: apiKey,
      temperature: 0.5,
    });

    // Build Zod schema from template sections (same logic as OpenAI version)
    const schema: Record<string, z.ZodType<string | null | undefined>> = {
      fileTitle: z
        .string()
        .describe(
          'A suggested title for the Obsidian Note. Ensure that it is in the proper format for a file on mac, windows and linux, do not include any special characters',
        ),
    };

    activeNoteTemplate.sections.forEach((section) => {
      const { sectionHeader, sectionInstructions, isSectionOptional } = section;
      schema[convertToSafeJsonKey(sectionHeader)] = isSectionOptional
        ? z.string().nullish().describe(sectionInstructions)
        : z.string().describe(sectionInstructions);
    });

    const structuredOutput = z.object(schema);

    // Create structured LLM with type assertion for LangChain 1.x compatibility
    const structuredLlm = llm.withStructuredOutput(structuredOutput as any, {
      name: 'summarize_transcript',
    });

    // Build user message with system prompt included
    // Claude's API with withStructuredOutput requires a HumanMessage, not SystemMessage
    let combinedPrompt = systemPrompt;

    if (scribeOutputLanguage) {
      combinedPrompt += `\n\nIMPORTANT: Please respond in ${scribeOutputLanguage} language.`;
    }

    combinedPrompt += '\n\nPlease analyze the transcript and provide the structured summary.';

    const messages = [new HumanMessage(combinedPrompt)];

    // Invoke and get structured result
    const result = (await structuredLlm.invoke(messages)) as Record<
      string,
      string
    > & { fileTitle: string };

    return result;
  } catch (error) {
    // Provide helpful error messages for common Claude API issues
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      throw new Error(
        `Claude API authentication failed. Please check your API key at https://console.anthropic.com/settings/keys`,
      );
    } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error(
        `Claude API rate limit exceeded. Please wait a moment and try again.`,
      );
    } else if (error.message?.includes('500') || error.message?.includes('529')) {
      throw new Error(
        `Claude API server error. The service may be temporarily unavailable. Please try again later.`,
      );
    } else if (error.message?.includes('model') && error.message?.includes('not found')) {
      throw new Error(
        `Claude model "${model}" not found. Please check the model name in settings.`,
      );
    } else if (error.message?.includes('context') || error.message?.includes('too long')) {
      throw new Error(
        `Transcript is too long for Claude API. Try recording a shorter audio clip.`,
      );
    } else {
      // Re-throw original error with additional context
      throw new Error(`Claude summarization error: ${error.message}`);
    }
  }
}
