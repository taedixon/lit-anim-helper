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

export class Animation implements ChangeEvent, ToCheapassTreeNode<AnimationComponent> {

	private readonly id = uuidv4();
	public name = "New Animation";
	public offsetX = 0;
	public offsetY = 0;
	public sizeX = 16;
	public sizeY = 16;
	public looping = false;
	public randomizeStart = false;

	public frames: AnimationFrame[] = [];

	public onChange = () => {};

	constructor(model?: AnimModel) {
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
		this.looping = model.looping ?? this.looping;
		this.randomizeStart = model.randomizeStart ?? this.randomizeStart;

		this.frames = [model.frame ?? []].flat()
				.map(frame => {
					const f = new AnimationFrame(this, frame);
					f.onChange = () => this.onChange();
					return f;
				});
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
}