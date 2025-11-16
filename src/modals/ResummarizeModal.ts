import { App, Modal, TFile, Notice } from 'obsidian';

export class ResummarizeModal extends Modal {
  private markdownFiles: TFile[];
  private selectedFile: TFile | null = null;
  private onSelect: (file: TFile) => Promise<void>;

  constructor(app: App, onSelect: (file: TFile) => Promise<void>) {
    super(app);
    this.onSelect = onSelect;
    this.markdownFiles = this.getMarkdownFiles();
  }

  private getMarkdownFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles();
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Select transcript note to re-summarize' });

    if (this.markdownFiles.length === 0) {
      contentEl.createEl('p', {
        text: 'No markdown files found in vault.'
      });
      return;
    }

    // File list container
    const listContainer = contentEl.createDiv({ cls: 'scribe-file-list' });

    this.markdownFiles.forEach(file => {
      const fileItem = listContainer.createDiv({ cls: 'scribe-file-item' });

      // File name
      fileItem.createEl('div', {
        text: file.basename,
        cls: 'scribe-file-name'
      });

      // File details
      const details = fileItem.createEl('div', { cls: 'scribe-file-details' });
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
      text: 'Re-summarize',
      cls: 'mod-cta'
    });
    processBtn.addEventListener('click', async () => {
      if (this.selectedFile) {
        this.close();
        new Notice(`Re-summarizing ${this.selectedFile.basename}...`);
        try {
          await this.onSelect(this.selectedFile);
        } catch (error) {
          new Notice(`Error re-summarizing file: ${error.message}`);
          console.error('Scribe re-summarize error:', error);
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
