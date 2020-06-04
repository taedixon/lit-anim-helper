import { Animation } from "./animation";
import { ChangeEvent } from "..";
import { CheapassTreeNode, ToCheapassTreeNode } from "../components/cheapass-tree";
import { AnimationRoot, AnimationComponent } from "./animation-root";
import {v4 as uuidv4} from "uuid";

export class AnimationFrame implements ChangeEvent, ToCheapassTreeNode<AnimationComponent> {
	public readonly id = uuidv4();
	public readonly animation: Animation;
	public name = "New Frame";
	public hitbox = "";
	public sound = "";
	public action: string[] = [];

	public x = 0;
	public y = 0;
	public time = 0.125;
	public alpha = 1.0;

	public readonly customStep = new Map<keyof this & string, number>()

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
		this.customStep.set("time", 0.001);
		this.customStep.set("alpha", 0.01);
	}

	private setFromModel(model: AnimFrameModel) {
		this.hitbox = model.hitbox ?? "";
		this.sound = model.sound ?? "";
		this.action = [model.action ?? []].flat();
		this.x = +model.$.x;
		this.y = +model.$.y;
		this.time = +model.$.time;
		this.alpha = model.$.alpha ? +model.$.alpha : 1.0;
	}

	public toCheapassTreeNode(parentKey = ""): CheapassTreeNode<AnimationComponent> {
		const key = `${parentKey}${AnimationRoot.JOIN}${this.id}`
		return {
			label: this.name,
			value: this,
			key
		}
	}

	public toModel(): AnimFrameModel {
		const model: AnimFrameModel = {
			hitbox: this.hitbox.length > 0 ? this.hitbox : undefined,
			sound: this.sound.length > 0 ? this.sound : undefined,
			action: this.action.length > 0 ? this.action : undefined,
			$: {
				x: this.x,
				y: this.y,
				time: this.time,
				alpha: this.alpha !== 1.0 ? this.alpha : undefined
			},
		}
		return model;
	}

	public removeFromParent() {
		this.animation.removeFrame(this.id);
	}

}