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
		h3 {
			margin-top: 0;
		}
	`;
}

export class AppUtil {
	public static readonly CONTENT_PATH = "../../Content"
	private static isElectron?: boolean;
	public static get IS_ELECTRON() {
		if (AppUtil.isElectron === undefined) {
			AppUtil.isElectron = /electron/i.test(navigator?.userAgent ?? "none");
		}
		return AppUtil.isElectron;
	}

	public static removeUndefinedKeys(obj: {[index: string]: any}) {
		Object.keys(obj).forEach(key => {
			if (obj[key] && typeof obj[key] === "object") {
				AppUtil.removeUndefinedKeys(obj[key]); // recurse
			} else if (obj[key] == null) {
				delete obj[key]; // delete
			}
		});
		return obj;
	}
}