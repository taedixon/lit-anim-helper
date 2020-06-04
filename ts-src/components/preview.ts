import { customElement, LitElement, css, html, property } from "lit-element";
import { AnimationComponent } from "../anim/animation-root";
import { AnimationFrame } from "../anim/frame";
import { Animation } from "../anim/animation";
import { AppStyles } from "../common";

import "@material/mwc-textfield";
import "@material/mwc-formfield";
import "@material/mwc-checkbox";
import "@material/mwc-button"
import { TextField } from "@material/mwc-textfield";


@customElement("animator-preview")
export class AnimatorPreview extends LitElement {
	public static get styles() {
		return  [
			css`
			:host {
				background-color: cornflowerblue;
				flex: 0 0 auto;
				max-width: 400px;
				overflow: auto;
				padding: 1em;
			}

			canvas {
				background-color: azure;
				display: block;
				margin-bottom: 0.5em;
			}

			#canvas {
				image-rendering: pixelated;
			}
			`,
			AppStyles.COMMON_CLASSES,
			AppStyles.MWC_INPUT_STYLES,
		]
	}

	private spritesheet?: ImageBitmap;
	private selected?: AnimationComponent;

	private nextFrameTime = 0;
	private frameIndex = 0;
	private loopStart = 0;
	private loopEnd = 0;

	@property()
	private scale = 2;

	@property()
	private looping = true;

	@property()
	private playbackSpeed = 1;


	public firstUpdated() {
		this.shadowRoot?.getElementById("nopreview")
			?.addEventListener("load", () => this.redraw());
	}

	private onScaleChange(e: InputEvent) {
		const target = e.target as TextField;
		this.scale = +(target.value)
		this.resetAnimation();
		this.redraw();
	}

	private onSpeedChange(e: InputEvent) {
		const target = e.target as TextField;
		this.playbackSpeed = +(target.value)
		if (this.playbackSpeed < 0) {
			this.playbackSpeed = 0.1;
		}
		this.resetAnimation();
		this.redraw();
	}

	private onResetAnim() {
		this.resetAnimation();
		this.redraw();
		requestAnimationFrame((t) => {this.animationCallback(t)});
	}

	public render() {
		return html`
			<h3>Preview</h3>
			<img id="nopreview" src="./static/nopreview.png" style="display:none" />
			<img id="pattern" src="./static/pattern.png" style="display:none" />
			<canvas id="canvas"></canvas>
			<canvas id="slider" height="10"></canvas>
			<mwc-formfield label="Loop preview">
				<mwc-checkbox @change="${() => this.looping = !this.looping}"
					?checked="${this.looping}">
				</mwc-checkbox>
			</mwc-formfield>
			<mwc-button raised label="Restart" @click="${this.onResetAnim}"></mwc-button>
			<mwc-textfield label="Scale" type="number" step="0.5" value="${this.scale}"
				@change="${this.onScaleChange}"></mwc-textfield>
			<mwc-textfield label="Playback Speed" type="number" step="0.1" min="0.1" value="${this.playbackSpeed}"
				@change="${this.onSpeedChange}"></mwc-textfield>
		`;
	}

	private get canvas() {
		return this.shadowRoot?.getElementById("canvas") as HTMLCanvasElement;
	}

	private get slider() {
		return this.shadowRoot?.getElementById("slider") as HTMLCanvasElement;
	}

	private get pattern() {
		return this.shadowRoot?.getElementById("pattern") as HTMLImageElement;
	}

	public setSpritesheet(image: ImageBitmap|undefined) {
		this.spritesheet = image;
		this.redraw();
	}

	public setSelected(comp?: AnimationComponent) {
		this.selected = comp;
		this.resetAnimation();
		this.redraw();
		requestAnimationFrame((t) => {this.animationCallback(t)});
	}

	private redraw() {
		const context = this.canvas.getContext("2d");
		if (!context) {
			console.error("Failed to get context!");
			return;
		}
		context.imageSmoothingEnabled = false;
		if (!this.spritesheet) {
			this.drawPlaceholder(context);
			return;
		}
		if (this.selected instanceof AnimationFrame) {
			this.drawFrame(context, this.selected, this.spritesheet);
		} else if (this.selected instanceof Animation
			&& this.frameIndex < this.selected.frames.length) {

			const frame = this.selected.frames[this.frameIndex];
			this.drawFrame(context, frame, this.spritesheet);
		} else {
			this.drawPlaceholder(context);
		}
	}

	private drawPlaceholder(context: CanvasRenderingContext2D) {
		const img = this.shadowRoot?.getElementById("nopreview") as HTMLImageElement;
		this.canvas.width = img.width;
		this.canvas.height = img.height;
		this.slider.width = img.width;
		context.drawImage(img, 0, 0);
	}

	private drawFrame(
			context: CanvasRenderingContext2D,
			frame: AnimationFrame,
			spritesheet: ImageBitmap) {
		const frameW = frame.w * this.scale;
		const frameH = frame.h * this.scale;
		if (this.canvas.width != frameW) {
			this.canvas.width = frameW;
			this.slider.width = frameW;
		}
		if (this.canvas.height != frameH) {
			this.canvas.height = frameH;
		}
		const fill = this.pattern;
		const patter = context.createPattern(fill, "repeat");
		if (patter) {
			context.fillStyle = patter;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		context.drawImage(
			spritesheet,
			frame.x,
			frame.y,
			frame.w,
			frame.h,
			0, 0, frameW, frameH
		)
	}

	private animationCallback(time: number) {
		if (this.selected instanceof Animation) {
			this.redrawTimeline(time);
			const advance = this.checkAdvanceFrame(time, this.selected);
			if (advance.newframe) {
				this.redraw();
			}
			if (this.looping || !advance.looped) {
				requestAnimationFrame((t) => {this.animationCallback(t)});
			}
		} else {
			this.redraw();
		}
	}

	private checkAdvanceFrame(time: number, anim: Animation): {newframe: boolean, looped?: boolean} {
		if (time > this.nextFrameTime) {
			this.frameIndex++;
			if (this.frameIndex >= anim.frames.length) {
				this.resetAnimation();
				return {
					newframe: true,
					looped: true
				}
			} else {
				this.nextFrameTime += anim.frames[this.frameIndex].time * 1000 / this.playbackSpeed;
			}
			return {newframe: true};
		}
		return {newframe: false};
	}

	private resetAnimation() {
		if (this.selected instanceof Animation && this.selected.frames.length > 0) {
			this.frameIndex = 0;
			const frame = this.selected.frames[0];
			this.loopStart = performance.now();
			this.loopEnd = this.loopStart + this.selected.frames
				.map(f => f.time * 1000 / this.playbackSpeed)
				.reduce((a, b) => a+b, 0);
			this.nextFrameTime = this.loopStart + frame.time * 1000 / this.playbackSpeed;
		}
	}

	private redrawTimeline(time: number) {
		const timeline = this.slider;
		if (this.selected instanceof Animation) {
			const context = timeline.getContext("2d");
			if (!context) {
				console.error("couldn't get context for timeline");
				return;
			}
			const elapsed = time - this.loopStart;
			const duration = this.loopEnd - this.loopStart;
			const barW = timeline.width;
			const barH = timeline.height;
			const position = elapsed / duration * barW;
			context.clearRect(0, 0, barW, barH);
			context.lineWidth = 2;
			// draw a pip marking the end of each frame
			let frameElapsed = 0;
			context.strokeStyle = "#333";
			for (const frame of this.selected.frames) {
				frameElapsed += frame.time * 1000 / this.playbackSpeed;
				const framePos = frameElapsed / duration * barW;
				if (framePos < barW){
					context.beginPath();
					context.moveTo(framePos, 0);
					context.lineTo(framePos, barH);
					context.stroke();
				}
			}
			// draw pip for current position
			context.strokeStyle = "#F00";
			context.beginPath();
			context.moveTo(position, 0);
			context.lineTo(position, barH);
			context.stroke();
		}
	}
}
