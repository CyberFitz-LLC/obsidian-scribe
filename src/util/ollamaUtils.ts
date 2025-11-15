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

  CRITICAL: You MUST respond with ONLY valid JSON. Do NOT include any explanatory text, thinking process, or commentary.
  Start your response with { and end with }. Nothing else.
  If you cannot generate content for a field, use an empty string "" but include the field.

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
      // Make all fields optional with defaults for Ollama compatibility
      // Smaller Ollama models struggle with strict structured output
      schema[convertToSafeJsonKey(sectionHeader)] = z
        .string()
        .optional()
        .default('')
        .describe(sectionInstructions);
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

    // Invoke and get structured result
    let rawResult = (await structuredLlm.invoke(messages)) as any;

    // Some models (like qwen3) may include explanatory text before/after JSON
    // Try to extract JSON if the response is a string with JSON embedded
    if (typeof rawResult === 'string') {
      console.log('Ollama returned string instead of object, attempting JSON extraction...');

      // Try to find JSON object in the string
      const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          rawResult = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from text response');
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
          throw new Error('Model returned text instead of JSON. Try a different model or check the response format.');
        }
      } else {
        throw new Error('Model returned text without valid JSON. Response: ' + rawResult.substring(0, 200));
      }
    }

    // Ollama wraps the response in a different format than OpenAI
    // Check if response is wrapped in {name, parameters} or {name, arguments} structure
    let result: Record<string, string> & { fileTitle: string };

    if (rawResult && typeof rawResult === 'object') {
      if ('parameters' in rawResult) {
        // Unwrap the parameters object
        result = rawResult.parameters;
      } else if ('arguments' in rawResult) {
        // Some models use 'arguments' instead of 'parameters'
        result = rawResult.arguments;
      } else {
        // Use response as-is
        result = rawResult;
      }
    } else {
      throw new Error('Invalid response format from Ollama');
    }

    // Validate and fix the result
    if (!result || typeof result !== 'object') {
      console.error('Ollama response validation failed:', rawResult);
      throw new Error('Ollama returned invalid response structure. Check console for details.');
    }

    // Ensure all required fields exist with defaults
    const validatedResult: Record<string, string> & { fileTitle: string } = {
      ...result,
      fileTitle: result.fileTitle || 'Untitled Note', // Override after spread to provide default
    };

    // Ensure all template sections have values (even if empty)
    activeNoteTemplate.sections.forEach((section) => {
      const key = convertToSafeJsonKey(section.sectionHeader);
      if (!validatedResult[key]) {
        validatedResult[key] = '';
      }
    });

    console.log('Ollama summarization successful:', {
      fileTitle: validatedResult.fileTitle,
      fieldsCount: Object.keys(validatedResult).length,
    });

    return validatedResult;
  } catch (error) {
    // Try to extract JSON from parsing errors
    if (error.message?.includes('Failed to parse') && error.message?.includes('Text:')) {
      console.log('Attempting to extract JSON from parsing error...');

      // Extract the text from the error message
      const textMatch = error.message.match(/Text: "(.+?)"\. Error:/s);
      if (textMatch && textMatch[1]) {
        const responseText = textMatch[1];

        // Try to find JSON in the response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0]);
            console.log('Successfully extracted JSON from error message');

            // Process the extracted JSON through the same validation logic
            let result = extracted;
            if (extracted.parameters) {
              result = extracted.parameters;
            } else if (extracted.arguments) {
              result = extracted.arguments;
            }

            const validatedResult: Record<string, string> & { fileTitle: string } = {
              ...result,
              fileTitle: result.fileTitle || 'Untitled Note',
            };

            activeNoteTemplate.sections.forEach((section) => {
              const key = convertToSafeJsonKey(section.sectionHeader);
              if (!validatedResult[key]) {
                validatedResult[key] = '';
              }
            });

            console.log('Recovered from parsing error:', {
              fileTitle: validatedResult.fileTitle,
              fieldsCount: Object.keys(validatedResult).length,
            });

            return validatedResult;
          } catch (parseError) {
            console.error('Failed to parse extracted JSON:', parseError);
          }
        }
      }
    }

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
    } else if (error.message?.includes('does not support tools')) {
      throw new Error(
        `Model "${model}" does not support structured output. Try: qwen3:8b, llama3.1:8b, or deepseek-r1:8b`,
      );
    } else {
      // Re-throw original error with additional context
      throw new Error(`Ollama summarization error: ${error.message}`);
    }
  }
}
