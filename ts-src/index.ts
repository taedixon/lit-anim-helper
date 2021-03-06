import { LitElement, html, customElement, css } from "lit-element";

import "./components/controls";
import "./components/spritesheet";
import "./components/preview";
import { TreeSelectEvent } from "./components/cheapass-tree";
import { AnimationComponent } from "./anim/animation-root";
import { AnimatorSpritesheet } from "./components/spritesheet";
import { AnimLoadedEvent } from "./components/controls";
import { AppUtil } from "./common";
import { AnimatorPreview } from "./components/preview";

export interface ChangeEvent {
	onChange: () => void;
	customStep?: Map<keyof this & string, number>;
};

@customElement("animator-app")
export class AnimatorApp extends LitElement {
	public static get styles() {
		return [
			css`
			#page {
				background-color: salmon;
				display: flex;
				flex-direction: row;
				align-content: stretch;
				height: 100%;
			}
			`
		]
	}
	public render() {
		return html`
			<div id="page">
				<animator-controls
					@node-selected="${this.onNodeSelected}"
					@anim-loaded="${this.onAnimLoaded}">
				</animator-controls>
				<animator-spritesheet id="spritesheet"
					@spritesheet-changed="${this.onSpritesheetChange}">

				</animator-spritesheet>
				<animator-preview id="preview"></animator-preview>
			</div>`;
	}

	async connectedCallback() {
		super.connectedCallback();
		if (AppUtil.IS_ELECTRON) {
			const ipcRenderer = (await import("electron")).ipcRenderer;
			const msg = await ipcRenderer.invoke("get-message");
			console.log(`It's ${msg} town`);
		}
	}


	private get spritesheet() {
		return this.shadowRoot?.getElementById("spritesheet") as AnimatorSpritesheet;
	}

	private get preview() {
		return this.shadowRoot?.getElementById("preview") as AnimatorPreview;
	}

	private onNodeSelected(e: TreeSelectEvent<AnimationComponent>) {
		this.spritesheet.setSelected(e.detail.value);
		this.preview.setSelected(e.detail.value);
	}

	private onAnimLoaded(e: AnimLoadedEvent) {
		const anim = e.detail
		anim.onChange = () => {
			this.spritesheet.redraw();
		}
		if (AppUtil.IS_ELECTRON) {
			this.spritesheet.getSpritesheetFromAnim(anim);
		}
	}

	private onSpritesheetChange(event: CustomEvent<ImageBitmap>) {
		this.preview.setSpritesheet(event.detail);
	}
}