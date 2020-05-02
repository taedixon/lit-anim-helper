
import { customElement, LitElement, css, html, TemplateResult, property } from "lit-element";

export interface CheapassTreeNode<T> {
	label: string,
	value?: T,
	key: string,
	items?: CheapassTreeNode<T>[]
}

interface ExpandableNode<T> {
	expanded: boolean;
	value: string,
	key: string,
	item?: T,
	children: ExpandableNode<T>[];
}

export type TreeSelectEvent<T> = CustomEvent<{key: string, value?: T}>;

export interface ToCheapassTreeNode<T> {
	toCheapassTreeNode(): CheapassTreeNode<T>;
}

@customElement("cheapass-tree")
export class CheapassTree<T> extends LitElement {
	public static get styles() {
		return  [
			css`
			:host {
				border: 1px solid black;
				display: block;
				background-color: white;
				min-width: 200px;
			}

			pre {
				margin: 0;
				padding: 4px;
				border-bottom: 1px solid black;
				cursor: pointer;
			}
			pre:hover {
				background-color: #DDD;
			}
			pre.selected {
				background-color: pink;
			}
			`
		]
	}

	private root?: CheapassTreeNode<T> | ToCheapassTreeNode<T>;

	@property()
	private nodeList?: ExpandableNode<T>;

	@property()
	private selected?: string;

	public set rootNode(node: CheapassTreeNode<T>|ToCheapassTreeNode<T>|undefined) {
		if (this.root === node) {
			return;
		}
		this.root = node;
		if (node) {
			if ("toCheapassTreeNode" in node) {
				this.nodeList = this.toNodeList(node.toCheapassTreeNode());
			} else {
				this.nodeList = this.toNodeList(node);
			}
		} else {
			this.nodeList = undefined;
		}
	}

	public get rootNode(): CheapassTreeNode<T>|ToCheapassTreeNode<T>|undefined {
		return this.root;
	}

	private toNodeList(node: CheapassTreeNode<T>): ExpandableNode<T> {
		const root: ExpandableNode<T> = {
			expanded: false,
			value: node.label,
			item: node.value,
			key: node.key,
			children: node.items?.flatMap(n => this.toNodeList(n)) ?? [],
		};
		return root;
	}

	public render() {
		return html`
		<div class="container">
				${this.nodeList
					? this.renderList(this.nodeList, "", 0)
					: html`<pre>Empty!</pre>`}
		</div>`;
	}

	public renderList(item: ExpandableNode<T>, parentKey: string, level: number): TemplateResult[] {
		const spacing = "".padStart(level, "  ");
		let arrow = "";
		let cssClass = item.key === this.selected ? "selected" : "";
		let children: TemplateResult[] = [];
		if (item.children.length > 0) {
			arrow = item.expanded ? "⮛" : "➢";
			if (item.expanded) {
				children = item.children.flatMap(i => this.renderList(i, "", level+1));
			}
		}
		const currentNode = html`
			<pre class="${cssClass}" @click="${() => this.nodeTapped(item)}"><!--
				-->${spacing}${arrow}${item.value}</pre>`;
		return [currentNode, children].flat();
	}

	private nodeTapped(node: ExpandableNode<T>) {
		node.expanded = !node.expanded;
		this.selected = node.key;
		this.dispatchEvent(new CustomEvent(
			"node-selected", {
				detail: {
					key: node.key,
					value: node.item
				},
				bubbles: true,
				composed: true,
			}) as TreeSelectEvent<T>);
		if (this.nodeList) {
			this.nodeList = Object.assign({}, this.nodeList);
		}
	}
}
