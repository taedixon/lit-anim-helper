
import { customElement, LitElement, css, html, TemplateResult, property } from "lit-element";

export interface CheapassTreeNode<T> {
	label: string,
	value?: T,
	key: string,
	items?: CheapassTreeNode<T>[]
}

interface KeyAttribs {
	expanded: boolean;
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

	@property()
	private root?: CheapassTreeNode<T> | ToCheapassTreeNode<T>;

	@property()
	private nodeAttribs?: Map<string, KeyAttribs>;

	@property()
	private selected?: string;

	@property()
	private renderhack = {};

	public set rootNode(node: CheapassTreeNode<T>|ToCheapassTreeNode<T>|undefined) {
		if (this.root === node) {
			return;
		}
		this.root = node;
		if (node) {
			const map = new Map<string, KeyAttribs>();
			if ("toCheapassTreeNode" in node) {
				this.nodeAttribs = this.makeNodeMap(map, node.toCheapassTreeNode());
			} else {
				this.nodeAttribs = this.makeNodeMap(map, node);
			}
		} else {
			this.nodeAttribs = undefined;
		}
	}

	public get rootNode(): CheapassTreeNode<T>|ToCheapassTreeNode<T>|undefined {
		return this.root;
	}

	private makeNodeMap(map: Map<string, KeyAttribs>, node: CheapassTreeNode<T>){
		map.set(node.key, {expanded: false});
		if (node.items) {
			for (const child of node.items) {
				this.makeNodeMap(map, child);
			}
		}
		return map;
	}

	public render() {
		let rootTree: CheapassTreeNode<T> | undefined;
		if (this.rootNode && "toCheapassTreeNode" in this.rootNode) {
			rootTree = this.rootNode.toCheapassTreeNode();
		} else {
			rootTree = this.rootNode;
		}
		return html`
		<div class="container">
				${rootTree
					? this.renderList(rootTree, this.renderhack, 0)
					: html`<pre>Empty!</pre>`}
		</div>`;
	}

	private renderList(item: CheapassTreeNode<T>, hack: object, level: number): TemplateResult[] {
		const spacing = "".padStart(level, "  ");
		let arrow = "";
		let cssClass = item.key === this.selected ? "selected" : "";
		let children: TemplateResult[] = [];
		if (item.items && item.items.length > 0) {
			const expanded = this.nodeAttribs?.get(item.key)?.expanded;
			arrow = expanded ? "⮛" : "➢";
			if (expanded) {
				children = item.items.flatMap(i => this.renderList(i, hack, level+1));
			}
		}
		const currentNode = html`
			<pre class="${cssClass}" @click="${() => this.nodeTapped(item)}"><!--
				-->${spacing}${arrow}${item.label}</pre>`;
		return [currentNode, children].flat();
	}

	public rebuild() {
		this.renderhack = {};
	}

	private nodeTapped(node: CheapassTreeNode<T>) {
		const nodeAttr = this.nodeAttribs?.get(node.key);
		if (nodeAttr) {
			nodeAttr.expanded = !nodeAttr.expanded;
		}
		this.selected = node.key;
		this.dispatchEvent(new CustomEvent(
			"node-selected", {
				detail: {
					key: node.key,
					value: node.value
				},
				bubbles: true,
				composed: true,
			}) as TreeSelectEvent<T>);
		this.renderhack = {};
	}
}
