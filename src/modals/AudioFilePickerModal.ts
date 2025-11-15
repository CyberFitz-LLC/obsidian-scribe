import { App, Modal } from 'obsidian';

export class AudioFilePickerModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Audio file picker - Coming in Phase 21');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
