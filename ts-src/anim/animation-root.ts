import { Animation } from "./animation";
import { AnimationFrame } from "./frame";
import { ChangeEvent } from "..";
import { ToCheapassTreeNode, CheapassTreeNode } from "../components/cheapass-tree";
import { AppUtil } from "../common";

export type AnimationComponent = AnimationRoot|Animation|AnimationFrame;

export class AnimationRoot implements ChangeEvent, ToCheapassTreeNode<AnimationComponent> {
	public static readonly JOIN = "⤐";
	private _filepath?: string;
	private _spritesheet = "";
	public lightmap?: string;
	public offsetX = 0;
	public offsetY = 0;

	private animations: Animation[] = [];

	public onChange = () => {};

	public get spritesheet() {
		return this._spritesheet;
	}

	public get filepath() {
		return this._filepath;
	}

	public get contentPath() {
		if (this.filepath) {
			const parent = this.filepath.substr(0, this.filepath.lastIndexOf('/'))
			return `${parent}/${AppUtil.CONTENT_PATH}`;
		}
		return undefined;
	}

	constructor(model?: AnimRootModel, path?: string) {
		this._filepath = path;
		if (model) {
			this.setFromModel(model);
		}
	}

	public toCheapassTreeNode(): CheapassTreeNode<AnimationComponent> {
		const key = "Animation";
		return {
			label: key,
			key,
			value: this,
			items: this.animations.map(anim => anim.toCheapassTreeNode(key)),
		}
	}

	private setFromModel(model: AnimRootModel) {
		this._spritesheet = model.sprite_sheet;
		this.lightmap = model.lightmap;
		this.offsetX = +(model.frame_offset_x ?? 0);
		this.offsetY = +(model.frame_offset_y ?? 0);

		this.animations = [model.animation].flat()
				.map(anim => {
					const a = new Animation(this, anim)
					a.onChange = () => this.onChange();
					return a;
				});
	}

	public removeAnimation(id: string) {
		this.animations = this.animations.filter(a => a.id !== id);
		this.onChange();
	}
}