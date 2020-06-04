import { LitElement, customElement, html, css, property, TemplateResult } from "lit-element";
import { Parser, Builder } from "xml2js";
import "./cheapass-tree";
import { AnimationRoot, AnimationComponent } from "../anim/animation-root";
import { TreeSelectEvent, CheapassTree } from "./cheapass-tree";
import { AnimationFrame } from "../anim/frame";
import { Animation } from "../anim/animation";

import { ChangeEvent } from "..";

export type AnimLoadedEvent = CustomEvent<AnimationRoot>

import "./object-controls";
import "@material/mwc-button"
import "./layout-frames-dialog";
import { LayoutFramesDialog } from "./layout-frames-dialog";
import { AppStyles, AppUtil } from "../common";
import { Button } from "@material/mwc-button";
import { FileResult } from "../electron";

@customElement("animator-controls")
export class AnimatorControls extends LitElement {

	public static get styles() {
		return [
			css`
			:host {
				background-color: seashell;
				max-width: 300px;
				flex: 0 1 auto;
				padding: 1em;
			}

			cheapass-tree {
				max-height: 35%;
				overflow: auto;
				margin-bottom: 1em;
			}

			.controls {
				max-height: 45%;
				overflow: auto;
			}

			.button-wrap {
				margin: 0.5em 0;
				text-align: center;
			}

			.delete-button {
				--mdc-theme-primary: tomato;
			}
			`,
			AppStyles.COMMON_CLASSES,
		]
	}

	@property()
	private error: string = "";

	@property()
	private loadedAnim?: AnimationRoot;

	@property()
	private selected?: AnimationComponent;

	private get layoutDialog() {
		return this.shadowRoot?.getElementById("layout-frames-dialog") as LayoutFramesDialog;
	}

	private get animTree() {
		return this.shadowRoot?.getElementById("anim-tree") as CheapassTree<AnimationComponent>;
	}

	public render() {
		let filepicker: TemplateResult;
		let saveButton = html``;
		if (AppUtil.IS_ELECTRON) {
			filepicker = html`
			<mwc-button raised label="Choose xml file" @click="${this.showElectronFileDialog}">
			</mwc-button>`
		} else {
			filepicker = html`
			<label for="xml-input">Choose an animation to edit</label>
			<input id="xml-input" @input="${this.onFileChange}" type="file" accept=".xml"/>`;
		}
		if (this.loadedAnim) {
			const saveAction = AppUtil.IS_ELECTRON ? this.onSaveElectron : this.onSaveBrowser;
			saveButton = html`
			<mwc-button raised label="Export XML" @click="${saveAction}">
			</mwc-button>`
		}
		return html`
			<h3>Controls</h3>
			${filepicker}
			${saveButton}
			<p class="error">${this.error}</p>
			<cheapass-tree id="anim-tree" .rootNode="${this.loadedAnim}"
				@node-selected="${this.onTreeNodeSelect}">
			</cheapass-tree>
			<div class="controls">
				${this.renderControls(this.selected)}
			</div>
			<layout-frames-dialog id="layout-frames-dialog"
				.selected="${this.selected}"
				@frames-changed="${this.onFramesChanged}">
			</layout-frames-dialog>
		`;
	}

	private renderControls(selected?: AnimationComponent) {
		if (!selected) {
			return "No Selection!";
		}
		let kind: string;
		if (selected instanceof AnimationRoot) {
			kind = "Animation Root";
			const fields = ["lightmap"] as const;
			return this.renderControlsGeneric(selected, kind, fields)
		} else if (selected instanceof Animation) {
			kind = "Animation";
			const fields = [
				"name", "offsetX", "offsetY",
				"sizeX", "sizeY", "looping", "randomizeStart"
			] as const;
			const custom = html`
				<div class="button-wrap"><mwc-button raised label="Layout Frames"
					@click="${() => this.layoutDialog.open()}">
				</mwc-button></div>
				${this.renderAddFrameButton(selected)}
				${this.renderDeleteButton(selected)}`;
			return this.renderControlsGeneric(selected, kind, fields, custom)
		} else if (selected instanceof AnimationFrame) {
			kind = "Frame";
			const fields = ["x", "y", "time", "alpha", "hitbox", "sound"] as const;
			const custom = this.renderDeleteButton(selected);
			return this.renderControlsGeneric(selected, kind, fields, custom)
		} else {
			return "[selected] had an unknown value!";
		}
	}

	private renderDeleteButton(item: Animation | AnimationFrame) {
		const clickAction = (e: InputEvent) => {
			const target = e.target as Button;
			if (!target.getAttribute("x-confirm")) {
				target.setAttribute("x-confirm", "true")
				target.label = "SUPER DUPER SURE?"
			} else {
				item.removeFromParent();
				this.selected = undefined;
				this.dispatchEvent(new CustomEvent("node-selected",
					{detail: {
						key: ""
					}}));
				this.onFramesChanged();
			}
		}
		return html`
		<div class="button-wrap">
			<mwc-button raised class="delete-button" label="Delete ${item.name}"
				@click="${clickAction}">
			</mwc-button>
		</div>`;
	}

	private renderAddFrameButton(item: Animation) {
		const clickAction = () => {
			item.addFrame({guessPlacement: true});
			this.onFramesChanged();
		}
		return html`
		<div class="button-wrap">
			<mwc-button raised label="Add Frame"
				@click="${clickAction}">
			</mwc-button>
		</div>`;
	}


	private renderControlsGeneric<T extends ChangeEvent>(
			selected: T,
			label: string,
			attribs: Readonly<Array<keyof T & string>>,
			custom?: TemplateResult) {
		return html`
			<object-controls
				title="${label}"
				.fields="${attribs}"
				.item="${selected}">
				${custom ? html`<div slot="custom-controls">${custom}</div>` : ""}
			</object-controls>
		`;
	}

	private onFileChange(e: InputEvent) {
		this.error = "";
		const input: HTMLInputElement = e.target as HTMLInputElement;
		if (input.files && input.files.length == 1) {
			this.readXml(input.files[0]);
		} else {
			this.error = `Either too many, or not enough files selected`;
		}
	}

	private onTreeNodeSelect(e: TreeSelectEvent<AnimationComponent>) {
		this.selected = e.detail.value;
	}

	private onFramesChanged() {
		this.animTree.rebuild();
	}

	private readXml(animFile: File) {
		const reader = new FileReader();
		reader.readAsText(animFile);
		reader.onloadend = () => {
			const data = reader.result as string;
			this.parseXml(data, animFile.name);
		}
		reader.onerror = (e) => {
			console.error(e);
			this.error = "Failed to load xml";
		}
	}

	private async parseXml(xml: string, path: string) {
		const parser = new Parser({
			explicitArray: false,
			explicitRoot: false,
		});

		const model: AnimRootModel | void = await parser.parseStringPromise(xml)
		if (model) {
			const anim = new AnimationRoot(model, path);
			this.loadedAnim = anim;
			this.dispatchEvent(new CustomEvent("anim-loaded", {
				detail: anim,
				bubbles: true,
				composed: true,
			}));
		} else {
			throw new Error(`Failed to load ${path}`);
		}
	}

	private async showElectronFileDialog() {
		if (AppUtil.IS_ELECTRON) {
			const ipcRenderer = (await import("electron")).ipcRenderer;
			const file: FileResult|null = await ipcRenderer.invoke("choose-file");
			if (file != null) {
				const fileText = Buffer.from(file.data).toString("utf-8");
				this.parseXml(fileText, file.path);
			}
		}
	}

	private onSaveBrowser() {

	}

	private async onSaveElectron() {
		if (AppUtil.IS_ELECTRON && this.loadedAnim) {
			const exportJson = this.loadedAnim.toModel();
			const xml = await this.modelToXml(exportJson);
			const ipcRenderer = (await import("electron")).ipcRenderer;
			await ipcRenderer.invoke("save-xml", this.loadedAnim.filepath, xml);
		}
	}

	private async modelToXml(model: AnimRootModel) {
		const builder = new Builder({
			mergeAttrs: true,
			explicitArray: false,
			explicitRoot: false,
			headless: true,
			rootName: "animations",
		})
		const stripped = AppUtil.removeUndefinedKeys(model);
		return builder.buildObject(stripped);
	}
}