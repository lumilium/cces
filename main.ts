import {Editor, MarkdownView, Plugin} from 'obsidian';

// Remember to rename these classes and interfaces!

interface ccesSettings {
	charactersES: boolean;
}

const DEFAULT_SETTINGS: ccesSettings = {
	charactersES: true,
}

export default class Cces extends Plugin {
	settings: ccesSettings;

	// Merged properties from WordCountPlugin
	charCount: number = 0;
	worker: Worker | null = null;
	charEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// Create a status bar item to display counts.
		this.charEl = this.addStatusBarItem();
		// (Optionally, assign a separate element to wordEl if needed.)

		// Update counts when a file is opened.
		this.registerEvent(
			this.app.workspace.on("file-open", async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					const content = await this.app.vault.read(activeFile);
					this.updateCount(content);
					this.updateDisplay();
				}
			})
		);

		// ─── editor-selection-change Event ───
		// When the user changes the selection, update the counts.
		this.registerEvent(
			(this.app.workspace as any).on("editor-selection-change", (editor: Editor, view: MarkdownView) => {
				// Get the current selection.
				let selection = editor.getSelection();
				// If the selection is empty (i.e. area released), use the entire editor content.
				if (selection.trim() === "") {
					selection = editor.getValue();
				}
				this.updateCount(selection);
				this.updateDisplay();
			})
		);
	}

	onunload() {
		// Cleanup if needed.
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onExternalSettingsChange() {
		// Reload in-memory settings.
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Merged updateCount method
	updateCount(text: string): void {
		if (this.settings.charactersES) {
			// Count characters excluding whitespace.
			this.charCount = text.replace(/\s+/g, "").length;
		}
		// Optionally, you could post the text to a worker for further processing.
		this.worker?.postMessage(text);
	}

	// Merged updateDisplay method
	updateDisplay(): void {
		let displayText = "";
		if (this.settings.charactersES) {
			displayText += `${this.charCount} characters(ES)`;
		}
		if (this.charEl) {
			this.charEl.addClass("status-bar-item-segment");
			this.charEl.textContent = displayText;
		}
	}
}
