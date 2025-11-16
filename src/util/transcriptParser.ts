import { convertToSafeJsonKey } from './textUtil';
import type { ScribeTemplate } from '../settings/components/NoteTemplateSettings';

/**
 * Extract transcript content from a note
 * Looks for content under "# Audio" or "# Audio in progress" heading
 * @param content - Full note content including frontmatter
 * @returns The transcript text, or null if not found
 */
export function extractTranscriptFromNote(content: string): string | null {
  // Remove frontmatter first
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // Look for Audio heading (with or without "in progress")
  const audioHeadingMatch = withoutFrontmatter.match(/^#\s+Audio(?:\s+in\s+progress)?\s*\n([\s\S]+?)(?=\n##|$)/m);

  if (!audioHeadingMatch) {
    return null;
  }

  let transcript = audioHeadingMatch[1];

  // Remove audio file embeds (e.g., ![[recording.mp3]])
  // Split by lines, filter out lines that are ONLY embeds, then rejoin
  const lines = transcript.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('![[') || !trimmed.endsWith(']]');
  });
  transcript = filteredLines.join('\n');

  return transcript.trim();
}

/**
 * Reconstruct note with new summary while preserving frontmatter and transcript
 * @param originalContent - Original note content
 * @param summary - New summary object with section keys
 * @param template - Note template defining sections
 * @returns Updated note content
 */
export function reconstructNoteWithSummary(
  originalContent: string,
  summary: Record<string, string>,
  template: ScribeTemplate
): string {
  // Extract frontmatter if present
  const frontmatterMatch = originalContent.match(/^(---[\s\S]*?---\n)/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

  // Extract the transcript section (everything under # Audio until first ## heading)
  const transcript = extractTranscriptFromNote(originalContent);
  if (!transcript) {
    throw new Error('Could not extract transcript from original note');
  }

  // Build new note
  let newContent = frontmatter;

  // Add Audio section with transcript
  newContent += '# Audio\n';
  newContent += transcript + '\n\n';

  // Add summary sections from template
  for (const section of template.sections) {
    const {
      sectionHeader,
      sectionOutputPrefix,
      sectionOutputPostfix,
      isSectionOptional,
    } = section;

    const sectionKey = convertToSafeJsonKey(sectionHeader);
    const sectionValue = summary[sectionKey];

    // Skip optional sections without content
    if (isSectionOptional && !sectionValue) {
      continue;
    }

    // Build section content
    newContent += `## ${sectionHeader}\n`;

    if (sectionOutputPrefix) {
      newContent += `${sectionOutputPrefix}\n`;
    }

    if (sectionValue) {
      newContent += `${sectionValue}\n`;
    }

    if (sectionOutputPostfix) {
      newContent += `${sectionOutputPostfix}\n`;
    }

    newContent += '\n';
  }

  return newContent.trimEnd() + '\n';
}
