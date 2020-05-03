import { css } from "lit-element";

export class AppStyles {
	public static readonly MWC_INPUT_STYLES = css`
		mwc-textfield {
			display: block;
		}
		mwc-formfield {
			display: block;
		}
	`;

	public static readonly COMMON_CLASSES = css`
		.error {
			color: tomato;
		}
	`;
}