import { AnimationFrame } from "./frame";
import { ChangeEvent } from "..";
import { ToCheapassTreeNode, CheapassTreeNode } from "../components/cheapass-tree";
import { AnimationRoot, AnimationComponent } from "./animation-root";

import {v4 as uuidv4} from "uuid";

export interface LayoutFrameOptions {
	startX: number;
	startY: number;
	numberOfFrames: number;
	width: number;
	height: number;
	delay: number;
	direction: "horizontal" | "vertical"
}

export interface AddFrameOptions {
	position?: {x: number, y: number},
	guessPlacement?: boolean,
	duration?: number,

}

export class Animation implements ChangeEvent, ToCheapassTreeNode<AnimationComponent> {

	public readonly id = uuidv4();
	private readonly animRoot: AnimationRoot;
	public name = "New Animation";
	public offsetX = 0;
	public offsetY = 0;
	public sizeX = 16;
	public sizeY = 16;
	public looping = true;
	public randomizeStart = false;

	public frames: AnimationFrame[] = [];

	public onChange = () => {};

	constructor(parent: AnimationRoot, model?: AnimModel) {
		this.animRoot = parent;
		if (model) {
			this.setFromModel(model);
		}
	}

	private setFromModel(model: AnimModel) {
		this.name = model.name;
		this.offsetX = +(model.frame_offset_x ?? this.offsetX);
		this.offsetY = +(model.frame_offset_y ?? this.offsetY);
		this.sizeX = +model.frame_size_x;
		this.sizeY = +model.frame_size_y;
		this.looping = !(model.looping?.toLowerCase() === "false")
		this.randomizeStart = model.randomizeStart?.toLowerCase() == 'true';

		this.frames = [model.frame ?? []].flat()
				.map(frame => {
					const f = new AnimationFrame(this, frame);
					f.onChange = () => this.onChange();
					return f;
				});
		this.renameFrames();
	}

	private renameFrames() {
		let frameNum = 1;
		for (const f of this.frames) {
			f.name = `Frame ${frameNum}`;
			++frameNum;
		}
	}

	public toCheapassTreeNode(parentKey = ""): CheapassTreeNode<AnimationComponent> {
		const key = `${parentKey}${AnimationRoot.JOIN}${this.id}`;
		return {
			label: this.name,
			key,
			value: this,
			items: this.frames.map(f => f.toCheapassTreeNode(key))
		}
	}

	public layoutFrames(options: LayoutFrameOptions) {
		this.frames = [];
		this.sizeX = options.width;
		this.sizeY = options.height;
		let x = options.startX;
		let y = options.startY;
		for (let i = 0; i < options.numberOfFrames; i++) {
			const newframe = new AnimationFrame(this, {
				x, y, time: options.delay
			})
			newframe.name = `Frame ${i}`;
			this.frames.push(newframe);
			if (options.direction === "horizontal") {
				x += options.width;
			} else {
				y += options.height;
			}
		}
		this.onChange();
	}

	public addFrame(options: AddFrameOptions) {
		let settings: AnimFrameModel = {
			x: 0,
			y: 0,
			time: 0.1,
		}
		const nframes = this.frames.length;
		if (options.guessPlacement) {
			if (nframes > 1) {
				// guess based on the relationship of the first two frames
				const xdiff = this.frames[1].x - this.frames[0].x;
				const ydiff = this.frames[1].y - this.frames[0].y;
				settings.x = this.frames[nframes-1].x + xdiff;
				settings.y = this.frames[nframes-1].y + ydiff;
			} else if (nframes === 1) {
				// no reference to go by.. just assume it's vertical layout
				settings.x = this.frames[0].x;
				settings.y = this.frames[0].y + this.sizeY;
			}
		}
		if (options.duration) {
			settings.time = options.duration;
		}
		const newframe = new AnimationFrame(this, settings);
		this.frames.push(newframe);
		this.onChange();
	}

	public removeFrame(id: string) {
		this.frames = this.frames.filter(f => f.id !== id);
		this.renameFrames();
	}

	public removeFromParent() {
		this.animRoot.removeAnimation(this.id);
	}
}