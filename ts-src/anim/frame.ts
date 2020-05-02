import { Animation } from "./animation";
import { ChangeEvent } from "..";
import { CheapassTreeNode, ToCheapassTreeNode } from "../components/cheapass-tree";
import { AnimationRoot, AnimationComponent } from "./animation-root";

export class AnimationFrame implements ChangeEvent, ToCheapassTreeNode<AnimationComponent> {
	public readonly animation: Animation;
	public name = "New Frame";
	public hitbox = "";
	public sound = "";
	public action: string[] = [];

	public x = 0;
	public y = 0;
	public time = 0.125;
	public alpha = 1.0;

	public onChange = () => {};

	public get w() {
		return this.animation.sizeX;
	}

	public get h() {
		return this.animation.sizeY;
	}

	constructor(anim: Animation, model?: AnimFrameModel) {
		this.animation = anim;
		if (model) {
			this.setFromModel(model);
		}
	}

	private setFromModel(model: AnimFrameModel) {
		this.hitbox = model.hitbox ?? "";
		this.sound = model.sound ?? "";
		this.action = [model.action ?? []].flat();
		this.x = +model.x;
		this.y = +model.y;
		this.time = +model.time;
		this.alpha = model.alpha ? +model.alpha : 1.0;
	}

	public toCheapassTreeNode(parentKey = ""): CheapassTreeNode<AnimationComponent> {
		const key = `${parentKey}${AnimationRoot.JOIN}${this.name}`
		return {
			label: this.name,
			value: this,
			key
		}
	}

}