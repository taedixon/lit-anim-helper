import { customElement, LitElement, css, html, property } from "lit-element";
import { AnimationComponent, AnimationRoot } from "../anim/animation-root";
import { AnimationFrame } from "../anim/frame";
import { Animation } from "../anim/animation";
import { AppUtil } from "../common";
import { ipcRenderer } from "electron";

@customElement("animator-spritesheet")
export class AnimatorSpritesheet extends LitElement {
	public static get styles() {
		return  [
			css`
			:host {
				background-color: plum;
				flex: 1 1 auto;
				width: 100%;
				padding: 1em;
				position: relative;
			}

			#canvas {
				background-color: azure;
				flex: 0 0 auto;
			}

			.canvas-container {
				overflow: auto;
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				left: 1em;
				right: 1em;
				bottom: 1em;
				top: 150px;
			}

			.overlay {
				z-index: 1;
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
				bottom: 0;
			}

			.dragover {
				border: 2px solid red;
				background-color: rgba(20, 20, 240, 0.2);
			}

			.error {
				color: tomato;
			}
			`
		]
	}

	@property()
	private error = "";

	private spritesheet?: ImageBitmap;

	private selected?: AnimationComponent;

	public render() {
		let input = html``;
		if (!AppUtil.IS_ELECTRON) {
			input = html`
			<label for="image-input">Set the spritesheet</label>
			<input id="image-input" @input="${this.onFileChange}" type="file" accept=".png" />`;
		}
		return html`
		<h2>Editor</h2>
		${input}
		<p class="error">${this.error}</p>
		<div class="canvas-container"
			@dragenter="${this.onDragEnter}"
			@dragexit="${this.onDragExit}"
			@dragover="${this.onDragOver}"
			@drop="${this.onDrop}">
			<div class="overlay" id="canvas-overlay"></div>
			<canvas id="canvas">
			</canvas>
			<img id="helpful" src="./static/dragdrop.png" style="display:none"/>
		</div>
		`;
	}

	public firstUpdated() {
		this.shadowRoot?.getElementById("helpful")
			?.addEventListener("load", () => this.redraw());
	}

	public setSelected(comp?: AnimationComponent) {
		this.selected = comp;
		this.redraw();
	}

	private get canvas() {
		return this.shadowRoot?.getElementById("canvas") as HTMLCanvasElement;
	}

	private get canvasOverlay() {
		return this.shadowRoot?.getElementById("canvas-overlay") as HTMLElement;
	}

	private onFileChange(e: InputEvent) {
		const input = this.shadowRoot?.getElementById("image-input") as HTMLInputElement | undefined;
		if (input?.files && input.files.length == 1) {
			this.loadSpritesheet(input.files[0]);
		} else {
			this.error = `Either too many, or not enough files selected`;
		}
	}

	private onDragEnter(e: DragEvent) {
		if (e.dataTransfer?.files) {
			this.canvasOverlay.classList.add("dragover");
		}
	}

	private onDragExit(e: DragEvent) {
		this.canvasOverlay.classList.remove("dragover");
	}

	private onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	private onDrop(e: DragEvent) {
		e.preventDefault();
		this.canvasOverlay.classList.remove("dragover");
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			this.loadSpritesheet(e.dataTransfer.files[0]);
		} else {
			console.log("Drop item not a file");
		}
	}

	private loadSpritesheet(src: File) {
		const reader = new FileReader();
		reader.readAsArrayBuffer(src);
		reader.onloadend = async () => {
			const data = new Blob([reader.result as ArrayBuffer]);
			this.spritesheet = await createImageBitmap(data);
			this.redraw();
		}
		reader.onerror = (e) => {
			console.error(e);
			this.error = "Failed to load spritesheet";
		}
	}

	public redraw() {
		const context = this.canvas.getContext("2d");
		if (!context) {
			console.error("Failed to get context!");
			return;
		}
		if (!this.spritesheet) {
			const img = this.shadowRoot?.getElementById("helpful") as HTMLImageElement;
			console.log(img);
			context.drawImage(img, 0, 0);
			return;
		}
		this.canvas.width = this.spritesheet.width;
		this.canvas.height = this.spritesheet.height;
		context.drawImage(this.spritesheet, 0, 0);
		if (this.selected) {
			this.drawSelected(context, this.selected);
		}
	}

	private drawSelected(context: CanvasRenderingContext2D, selected: AnimationComponent) {
		if (selected instanceof Animation) {
			for (const frame of selected.frames) {
				this.drawFrame(context, frame);
			}
		} else if (this.selected instanceof AnimationFrame) {
			this.drawSelected(context, this.selected.animation)
			context.strokeStyle = "#FF0000";
			context.lineWidth = 2;
			this.drawFrame(context, this.selected);
		}
	}

	private drawFrame(context: CanvasRenderingContext2D, frame: AnimationFrame) {
		context.translate(frame.x, frame.y);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(frame.w, 0);
		context.lineTo(frame.w, frame.h);
		context.lineTo(0, frame.h);
		// auto-closes the path
		context.closePath();
		context.stroke();
		context.translate(-frame.x, -frame.y);
	}

	// electron-only
	public async getSpritesheetFromAnim(anim :AnimationRoot) {
		const spritesheet = `${anim.contentPath}/${anim.spritesheet}.png`
		const data: Uint8Array|null = await ipcRenderer.invoke("read-file", spritesheet);
		if (data != null) {
			const blob = new Blob([data]);
			this.spritesheet = await createImageBitmap(blob);
			this.redraw();
		} else {
			console.error(`Couldn't read file at ${spritesheet}`);
		}
	}
}
