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

export class AppUtil {
	private static isElectron?: boolean;
	public static get IS_ELECTRON() {
		if (AppUtil.isElectron === undefined) {
			AppUtil.isElectron = /electron/i.test(navigator?.userAgent ?? "none");
		}
		return AppUtil.isElectron;
	}
}