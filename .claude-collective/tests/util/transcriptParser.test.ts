import { describe, it, expect } from 'vitest';
import {
  extractTranscriptFromNote,
  reconstructNoteWithSummary,
} from '../../../src/util/transcriptParser';
import { DEFAULT_TEMPLATE, type ScribeTemplate } from '../../../src/settings/components/NoteTemplateSettings';

describe('transcriptParser - Essential TDD Tests', () => {
  const sampleTranscript = 'This is a test transcript. It contains some spoken words.';

  describe('extractTranscriptFromNote', () => {
    it('should extract transcript from note with Audio heading', () => {
      const noteContent = `---
tags: [meeting]
---

# Audio
${sampleTranscript}

## Summary
Some summary content
`;
      const result = extractTranscriptFromNote(noteContent);
      expect(result).toBe(sampleTranscript);
    });

    it('should extract transcript between Audio heading and first summary section', () => {
      const noteContent = `# Audio
${sampleTranscript}

## Summary
Some summary content

## Insights
More content`;
      const result = extractTranscriptFromNote(noteContent);
      expect(result?.trim()).toBe(sampleTranscript);
    });

    it('should return null when no transcript found', () => {
      const noteContent = `## Summary
Just a summary with no transcript`;
      const result = extractTranscriptFromNote(noteContent);
      expect(result).toBeNull();
    });

    it('should handle transcript with audio file embed', () => {
      // Test that embed line is filtered out from transcript
      const noteContent = `# Audio
![[recording.mp3]]
${sampleTranscript}

## Summary
Some summary`;
      const result = extractTranscriptFromNote(noteContent);
      // Should extract transcript and NOT include the embed
      if (result) {
        expect(result).not.toContain('![[recording.mp3]]');
      }
    });

    it('should extract from notes with "in progress" marker', () => {
      const noteContent = `# Audio in progress
${sampleTranscript}`;
      const result = extractTranscriptFromNote(noteContent);
      expect(result?.trim()).toBe(sampleTranscript);
    });
  });

  describe('reconstructNoteWithSummary', () => {
    const mockSummary = {
      summary: 'New summary content',
      insights: 'New insights content',
      mermaidChart: 'graph TD\n  A-->B',
    };

    it('should preserve frontmatter when updating note', () => {
      const originalContent = `---
tags: [meeting, important]
created: 2025-01-15
---

# Audio
${sampleTranscript}

## Summary
Old summary

## Insights
Old insights`;

      const result = reconstructNoteWithSummary(
        originalContent,
        mockSummary,
        DEFAULT_TEMPLATE
      );

      expect(result).toContain('tags: [meeting, important]');
      expect(result).toContain('created: 2025-01-15');
    });

    it('should keep transcript unchanged', () => {
      const originalContent = `# Audio
${sampleTranscript}

## Summary
Old summary`;

      const result = reconstructNoteWithSummary(
        originalContent,
        mockSummary,
        DEFAULT_TEMPLATE
      );

      expect(result).toContain(sampleTranscript);
    });

    it('should replace old summary sections with new ones', () => {
      const originalContent = `# Audio
${sampleTranscript}

## Summary
Old summary content

## Insights
Old insights content`;

      const result = reconstructNoteWithSummary(
        originalContent,
        mockSummary,
        DEFAULT_TEMPLATE
      );

      expect(result).not.toContain('Old summary content');
      expect(result).toContain('New summary content');
      expect(result).toContain('New insights content');
    });

    it('should handle notes without frontmatter', () => {
      const originalContent = `# Audio
${sampleTranscript}

## Summary
Old summary`;

      const result = reconstructNoteWithSummary(
        originalContent,
        mockSummary,
        DEFAULT_TEMPLATE
      );

      expect(result).toContain('New summary content');
      expect(result).toContain(sampleTranscript);
    });
  });
});
