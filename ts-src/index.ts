import { LitElement, html, customElement, css } from "lit-element";

import "./components/controls";
import "./components/spritesheet";
import "./components/preview";
import { TreeSelectEvent } from "./components/cheapass-tree";
import { AnimationComponent } from "./anim/animation-root";
import { AnimatorSpritesheet } from "./components/spritesheet";
import { AnimLoadedEvent } from "./components/controls";

export interface ChangeEvent {onChange: () => void};

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
				<animator-spritesheet id="spritesheet"></animator-spritesheet>
				<animator-preview></animator-preview>
			</div>`;
	}

	private get spritesheet() {
		return this.shadowRoot?.getElementById("spritesheet") as AnimatorSpritesheet;
	}

	private onNodeSelected(e: TreeSelectEvent<AnimationComponent>) {
		this.spritesheet.setSelected(e.detail.value);
	}

	private onAnimLoaded(e: AnimLoadedEvent) {
		const anim = e.detail
		anim.onChange = () => {
			this.spritesheet.redraw();
		}
	}
}