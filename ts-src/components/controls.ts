import { LitElement, customElement, html, css, property } from "lit-element";
import { Parser } from "xml2js";
import "./cheapass-tree";
import { AnimationRoot, AnimationComponent } from "../anim/animation-root";
import { TreeSelectEvent } from "./cheapass-tree";
import { AnimationFrame } from "../anim/frame";
import { Animation } from "../anim/animation";

import { ChangeEvent } from "..";

export type AnimLoadedEvent = CustomEvent<AnimationRoot>

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

			.error {
				color: tomato;
			}
			`
		]
	}

	@property()
	private error: string = "";

	@property()
	private loadedAnim?: AnimationRoot;

	@property()
	private selected?: AnimationComponent;

	public render() {
		return html`
			<h2>Controls</h2>
			<label for="xml-input">Choose an animation to edit</label>
			<input id="xml-input" @input="${this.onFileChange}" type="file" accept=".xml"/>
			<p class="error">${this.error}</p>
			<cheapass-tree .rootNode="${this.loadedAnim}"
				@node-selected="${this.onTreeNodeSelect}">
			</cheapass-tree>
			<div class="controls">
				${this.renderControls(this.selected)}
			</div>
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
			return this.renderControlsGeneric(selected, kind, fields)
		} else if (selected instanceof AnimationFrame) {
			kind = "Frame";
			const fields = ["x", "y", "time", "alpha", "hitbox", "sound"] as const;
			return this.renderControlsGeneric(selected, kind, fields)
		} else {
			return "[selected] had an unknown value!";
		}
	}

	private renderControlsGeneric<T extends ChangeEvent>(
			selected: T,
			label: string,
			attribs: Readonly<Array<keyof T & string>>) {
		return html`
			<object-controls
				title="${label}"
				.fields="${attribs}"
				.item="${selected}">
			</object-controls>
		`;
	}

	private onFileChange(e: InputEvent) {
		console.log(e);
		this.error = "";
		const input: HTMLInputElement = e.target as HTMLInputElement;
		if (input.files && input.files.length == 1) {
			this.readXml(input.files[0]);
		} else {
			this.error = `Either too many, or not enough files selected`;
		}
	}

	private onTreeNodeSelect(e: TreeSelectEvent<AnimationComponent>) {
		console.log(e.detail);
		this.selected = e.detail.value;
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
			mergeAttrs: true,
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
}