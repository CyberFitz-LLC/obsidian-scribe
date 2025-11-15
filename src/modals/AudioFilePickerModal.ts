import { App, Modal, TFile, Notice } from 'obsidian';
import type ScribePlugin from '../index';

export class AudioFilePickerModal extends Modal {
  private plugin: ScribePlugin;
  private audioFiles: TFile[];
  private selectedFile: TFile | null = null;

  constructor(app: App, plugin: ScribePlugin) {
    super(app);
    this.plugin = plugin;
    this.audioFiles = this.getAudioFiles();
  }

  private getAudioFiles(): TFile[] {
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'webm', 'flac'];
    return this.app.vault.getFiles().filter(file =>
      audioExtensions.includes(file.extension.toLowerCase())
    );
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Select audio file to transcribe' });

    if (this.audioFiles.length === 0) {
      contentEl.createEl('p', {
        text: 'No audio files found in vault. Supported formats: MP3, WAV, M4A, OGG, WebM, FLAC'
      });
      return;
    }

    // File list container
    const listContainer = contentEl.createDiv({ cls: 'scribe-file-list' });

    this.audioFiles.forEach(file => {
      const fileItem = listContainer.createDiv({ cls: 'scribe-file-item' });

      // File name
      fileItem.createEl('div', {
        text: file.basename,
        cls: 'scribe-file-name'
      });

      // File details
      const details = fileItem.createEl('div', { cls: 'scribe-file-details' });
      details.createEl('span', { text: file.extension.toUpperCase() });
      details.createEl('span', { text: ' • ' });
      details.createEl('span', { text: file.path });

      // Click to select
      fileItem.addEventListener('click', () => {
        // Clear previous selection
        listContainer.querySelectorAll('.scribe-file-item').forEach(el =>
          el.removeClass('selected')
        );

        fileItem.addClass('selected');
        this.selectedFile = file;
      });
    });

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'scribe-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const processBtn = buttonContainer.createEl('button', {
      text: 'Process',
      cls: 'mod-cta'
    });
    processBtn.addEventListener('click', async () => {
      if (this.selectedFile) {
        this.close();
        new Notice(`Processing ${this.selectedFile.basename}...`);
        try {
          await this.plugin.scribeExistingFile(this.selectedFile);
        } catch (error) {
          new Notice(`Error processing file: ${error.message}`);
          console.error('Scribe file processing error:', error);
        }
      } else {
        new Notice('Please select a file first');
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
