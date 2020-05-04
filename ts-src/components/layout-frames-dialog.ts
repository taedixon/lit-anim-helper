import { LitElement, customElement, html, property } from "lit-element";

import { Dialog } from "@material/mwc-dialog"

import "@material/mwc-dialog"
import "@material/mwc-button";
import "@material/mwc-textfield"
import "@material/mwc-radio"
import "@material/mwc-formfield"
import { TextField } from "@material/mwc-textfield";
import { AppStyles } from "../common";
import { LayoutFrameOptions } from "../anim/animation";
import { Formfield } from "@material/mwc-formfield";
import { Checkbox } from "@material/mwc-checkbox";
import { Animation } from "../anim/animation";

export interface FormElements {
	startX: TextField;
	startY: TextField;
	frameW: TextField;
	frameH: TextField;
	delay: TextField;
	frameCount: TextField;
	layoutH: Formfield;
	layoutY: Formfield;
}

@customElement("layout-frames-dialog")
export class LayoutFramesDialog extends LitElement {

	public static get styles() {
		return [AppStyles.MWC_INPUT_STYLES];
	}

	@property()
	public selected?: Animation;

	private get form() {
		return this.shadowRoot?.getElementById("layout-frames-form") as HTMLFormElement;
	}

	private get dialog() {
		return this.shadowRoot?.getElementById("layout-frames-dialog") as Dialog
	}

	public render() {
		return html`
		<mwc-dialog id="layout-frames-dialog" heading="Layout Frames">
			<p>REPLACE all current frames with a NEW set of sequentially arranged frames</p>
			<form id="layout-frames-form">
				<mwc-textfield name="frameCount" label="Number of Frames"></mwc-textfield>
				<mwc-textfield name="startX" label="Start X"></mwc-textfield>
				<mwc-textfield name="startY" label="Start Y"></mwc-textfield>
				<mwc-textfield name="frameW" label="Frame Width"></mwc-textfield>
				<mwc-textfield name="frameH" label="Frame Height"></mwc-textfield>
				<mwc-textfield name="delay" type="number" step="0.1" value="0.1" label="Delay"></mwc-textfield>
				<mwc-formfield name="layoutH" label="Layout Horizontally">
					<mwc-radio name="layoutDir" value="horizontal"></mwc-radio>
				</mwc-formfield>
				<mwc-formfield name="layoutY" label="Layout Vertically">
					<mwc-radio name="layoutDir" value="vertical" checked></mwc-radio>
				</mwc-formfield>
			</form>
			<mwc-button slot="primaryAction" dialogAction="close" @click="${this.onConfirm}">Confirm</mwc-button>
			<mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
		</mwc-dialog>
		`
	}

	public open() {
		this.dialog.show();
	}

	public close() {
		this.dialog.close();
	}

	public onConfirm() {
		if (!(this.selected instanceof Animation)) {
			console.error("There is mischief afoot, and I will have none of it");
			return;
		}
		const elements = this.form.children as unknown as FormElements;
		try {
			const direction = (elements.layoutH.firstChild as Checkbox).checked ? "horizontal" : "vertical"
			const layoutRequest: LayoutFrameOptions = {
				startX: +elements.startX.value,
				startY: +elements.startY.value,
				width: +elements.frameW.value,
				height: +elements.frameH.value,
				delay: +elements.delay.value,
				numberOfFrames: +elements.frameCount.value,
				direction
			}
			this.selected.layoutFrames(layoutRequest);
			this.dispatchEvent(new CustomEvent("frames-changed"));
		} catch (err) {
			console.error(err);
		}
	}
}