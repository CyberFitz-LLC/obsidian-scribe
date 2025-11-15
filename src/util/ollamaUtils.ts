/**
 * Ollama utility functions for local LLM-based summarization
 * Mirrors the OpenAI implementation but uses local Ollama models
 */
import { ChatOllama } from '@langchain/ollama';
import { z } from 'zod';
import { SystemMessage } from '@langchain/core/messages';
import type { ScribeOptions } from 'src';
import { convertToSafeJsonKey } from './textUtil';

export async function summarizeTranscriptWithOllama(
  baseUrl: string,
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
    // Create ChatOllama instance with deterministic temperature for structured output
    const llm = new ChatOllama({
      model: model,
      baseUrl: baseUrl,
      temperature: 0, // Deterministic for structured output
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
    // Note: ChatOllama withStructuredOutput doesn't support name option like ChatOpenAI
    const structuredLlm = llm.withStructuredOutput(structuredOutput as any) as any;

    // Build messages array
    const messages = [new SystemMessage(systemPrompt)];

    if (scribeOutputLanguage) {
      messages.push(
        new SystemMessage(`Please respond in ${scribeOutputLanguage} language`),
      );
    }

    // Invoke and return structured result
    const result = (await structuredLlm.invoke(messages)) as Record<
      string,
      string
    > & { fileTitle: string };

    return result;
  } catch (error) {
    // Provide helpful error messages for common Ollama issues
    if (error.message?.includes('ECONNREFUSED')) {
      throw new Error(
        `Cannot connect to Ollama at ${baseUrl}. Is Ollama running? Start with: ollama serve`,
      );
    } else if (
      error.message?.includes('model') &&
      error.message?.includes('not found')
    ) {
      throw new Error(
        `Ollama model "${model}" not found. Pull it with: ollama pull ${model}`,
      );
    } else if (error.message?.includes('connection')) {
      throw new Error(
        `Connection error to Ollama at ${baseUrl}. Check if the server is running and accessible.`,
      );
    } else {
      // Re-throw original error with additional context
      throw new Error(`Ollama summarization error: ${error.message}`);
    }
  }
}
