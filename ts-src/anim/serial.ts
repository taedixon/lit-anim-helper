
interface AnimFrameModel {
	hitbox?: string;
	sound?: string;
	action?: string | string[];

	x: number|string;
	y: number|string;
	time: number|string;
	alpha?: number|string;
}

interface AnimModel {
	frame?: AnimFrameModel[];

	name: string;
	// per-animation offset to actor center
	frame_offset_x?: number|string;
	frame_offset_y?: number|string;

	loop_start_frame?: number|string;
	frame_size_x: number|string;
	frame_size_y: number|string;
	looping?: string;
	randomizeStart?: string;
}

interface AnimRootModel {
	animation: AnimModel | AnimModel[];

	sprite_sheet: string;
	lightmap?: string;
	// default sprite offset to actor center
	frame_offset_x?: number|string;
	frame_offset_y?: number|string;
}