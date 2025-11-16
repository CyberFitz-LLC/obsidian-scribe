import type ScribePlugin from 'src';
import { ScribeControlsModal } from 'src/modal/scribeControlsModal';
import { AudioFilePickerModal } from '../modals/AudioFilePickerModal';
import { ResummarizeModal } from '../modals/ResummarizeModal';
import { extractTranscriptFromNote, reconstructNoteWithSummary } from '../util/transcriptParser';
import { Notice } from 'obsidian';

export function handleCommands(plugin: ScribePlugin) {
  plugin.addCommand({
    id: 'scribe-recording-modal',
    name: 'Open recording modal',
    callback: () => {
      plugin.state.isOpen = true;
      new ScribeControlsModal(plugin).open();
    },
  });
  plugin.addCommand({
    id: 'scribe-recording-toggle-recording',
    name: 'Start/Stop recording',
    callback: () => {
      const isRecordingInProgress =
        plugin.state.audioRecord?.mediaRecorder?.state === 'recording';

      if (isRecordingInProgress) {
        plugin.scribe();
      } else {
        plugin.startRecording();
      }
    },
  });
  plugin.addCommand({
    id: 'scribe-transcribe-summarize',
    name: 'Transcribe & summarize current file',
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      if (activeFile) {
        plugin.scribeExistingFile(activeFile);
      }
    },
  });
  plugin.addCommand({
    id: 'scribe-fix-mermaid-chart',
    name: 'Fix mermaid chart',
    callback: () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      if (activeFile) {
        plugin.fixMermaidChart(activeFile);
      }
    },
  });
  plugin.addCommand({
    id: 'scribe-select-audio-file',
    name: 'Select and transcribe audio file',
    callback: async () => {
      const modal = new AudioFilePickerModal(plugin.app, plugin);
      modal.open();
    },
  });
  plugin.addCommand({
    id: 'scribe-resummarize-transcript',
    name: 'Re-summarize existing transcript',
    callback: async () => {
      const modal = new ResummarizeModal(plugin.app, async (file) => {
        try {
          // Read file content
          const content = await plugin.app.vault.read(file);

          // Extract transcript
          const transcript = extractTranscriptFromNote(content);
          if (!transcript) {
            new Notice('Scribe: Could not find transcript in file');
            return;
          }

          new Notice('Scribe: Found transcript, re-summarizing...');

          // Get current scribe options
          const scribeOptions = {
            scribeOutputLanguage: plugin.settings.scribeOutputLanguage,
            activeNoteTemplate: plugin.settings.activeNoteTemplate,
          };

          // Re-run summarization using existing method
          const summary = await plugin.handleTranscriptSummary(transcript, {
            isAppendToActiveFile: false,
            isOnlyTranscribeActive: false,
            isMultiSpeakerEnabled: false,
            isSaveAudioFileActive: false,
            isDisableLlmTranscription: false,
            audioFileLanguage: plugin.settings.audioFileLanguage,
            scribeOutputLanguage: scribeOptions.scribeOutputLanguage,
            transcriptPlatform: plugin.settings.transcriptPlatform,
            llmModel: plugin.settings.llmModel,
            activeNoteTemplate: scribeOptions.activeNoteTemplate,
          });

          // Reconstruct note with new summary
          const updatedContent = reconstructNoteWithSummary(
            content,
            summary,
            scribeOptions.activeNoteTemplate
          );

          // Update file
          await plugin.app.vault.modify(file, updatedContent);

          new Notice(`Scribe: ✅ Re-summarized: ${file.basename}`);
        } catch (error) {
          new Notice(`Scribe: Error re-summarizing: ${error.message}`);
          console.error('Scribe re-summarization error:', error);
        }
      });
      modal.open();
    },
  });
}
