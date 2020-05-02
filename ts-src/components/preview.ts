import { customElement, LitElement, css, html } from "lit-element";

@customElement("animator-preview")
export class AnimatorPreview extends LitElement {
	public static get styles() {
		return  [
			css`
			:host {
				background-color: cornflowerblue;
				flex: 0 0 auto;
				max-width: 400px;
			}
			`
		]
	}

	public render() {
		return html`<p>preview</p>`;
	}
}
