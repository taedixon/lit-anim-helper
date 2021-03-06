import { LitElement, customElement, html, css, property } from "lit-element";
import { ChangeEvent } from "..";
import { TextField, TextFieldType } from "@material/mwc-textfield";

import "@material/mwc-textfield";
import "@material/mwc-formfield";
import "@material/mwc-checkbox";
import { AppStyles } from "../common";
import { Checkbox } from "@material/mwc-checkbox";

@customElement("object-controls")
export class ObjectControls<T extends ChangeEvent> extends LitElement {

	public static get styles() {
		return [
			css`
			:host {
				display: block;
			}
			`,
			AppStyles.MWC_INPUT_STYLES
		]
	}

	@property()
	public item?: T;

	@property()
	public fields: Array<keyof T & string> = []

	@property()
	public title = "something";

	public render() {
		if (!this.item) {
			return html`<p>Nothing to edit yet.</p>`;
		}
		if (this.fields.length < 1) {
			return html`<p>No fields specified</p>`;
		}
		const item = this.item;
		return html`
			<h3>Editing ${this.title}</h3>
			${this.fields.map(attr => this.renderField(attr, item))}
			<slot name="custom-controls"></slot>
		`;
	}

	private renderField(field: keyof T & string, item: T) {
		const itemValue = item[field];
		if (typeof itemValue === "boolean") {
			const action = (e: InputEvent) => {
				const input = e.target as Checkbox;
				item[field] = input.checked as any;
			}
			return html`
			<mwc-formfield label="${field}">
				<mwc-checkbox @change="${action}" ?checked="${itemValue}"></mwc-checkbox>
			</mwc-formfield>`;
		} else {
			let type: TextFieldType = "text";
			let step = item.customStep?.get(field) ?? 1;
			if (typeof itemValue === "number") {
				type = "number";
			}
			const action = (e: InputEvent) => {
				const input = e.target as TextField;
				if (type == "number") {
					item[field] = +input.value as any;
				} else {
					item[field] = input.value as any;
				}
				item.onChange();
			}
			return html`
				<mwc-textfield label="${field}"
					value="${itemValue}"
					type="${type}"
					step="${step}"
					@change="${action}">
				</mwc-textfield>
			`
		}
	}
}