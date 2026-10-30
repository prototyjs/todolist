var __defProp = Object.defineProperty;
var __typeError = (msg) => {
	throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _storage, _storage2;
function isObject(value) {
	return typeof value === "object" && value !== null;
}
__name(isObject, "isObject");
function unbind(element) {
	if (!element._bound) {
		return;
	}
	for (const eventName in element._bound) {
		delete element[eventName];
	}
	delete element._bound;
}
__name(unbind, "unbind");
const log = {
	/**
	 * @param { string } text
	 * @param { Array } [args=[]]
	 */
	error(text2, ...args) {
	},
	warn(text2, ...args) {
	}
};
function dynamicFunction(code, bus, els, key = "") {
	if (!bus || typeof bus !== "object") {
		log.error("Developer Error: bus object must be provided to dynamicFunction");
	}
	const cacheKey = `${key}:${code}`;
	const cacheOwner = bus.root;
	if (!cacheOwner._fnCache) {
		Object.defineProperty(cacheOwner, "_fnCache", {
			value: /* @__PURE__ */ new Map(),
			enumerable: false,
			writable: true,
			configurable: true
		});
	}
	let fn = cacheOwner._fnCache.get(cacheKey);
	if (!fn) {
		const localDeclaration = key ? `const ${key} = local` : "";
		fn = new Function("el", "scope", "local", `
			${localDeclaration}
			with(scope) {
				try {
					return ${code}
				} catch (err) {
					console.warn('Runtime error in expression:', err)
					return undefined
				}
			}
		`);
		cacheOwner._fnCache.set(cacheKey, fn);
	}
	return (el, context, local) => {
		let scopeProxy = el._scopeProxy;
		if (!scopeProxy) {
			scopeProxy = new Proxy({}, {
				get(_, prop) {
					var _a;
					if (prop === "el") {
						return el;
					}
					const fromContext = (_a = el._currentContext) == null ? void 0 : _a[prop];
					if (fromContext !== void 0) {
						return fromContext;
					}
					if (prop in bus.state) {
						return bus.state[prop];
					}
					if (prop in bus.methods) {
						return bus.methods[prop];
					}
					if (prop in bus.params) {
						return bus.params[prop];
					}
					if (prop === "root") {
						return bus.root;
					}
					if (prop === "components") {
						return bus.components;
					}
					if (prop === "els") {
						return els;
					}
					if (prop === Symbol.unscopables) {
						return void 0;
					}
					if (prop in window) {
						return window[prop];
					}
					log.error('ReferenceError: "{0}" is not defined', prop, el);
				},
				set(_, prop, value) {
					if (prop in bus.state) {
						bus.state[prop] = value;
						return true;
					}
					if (el._currentContext && typeof el._currentContext === "object" && prop in el._currentContext) {
						el._currentContext[prop] = value;
						return true;
					}
					log.error(`Cannot set "${prop}" - property does not exist in state or context`, el);
					return false;
				},
				has(_, prop) {
					return prop !== key;
				}
			});
			el._scopeProxy = scopeProxy;
		}
		el._currentContext = context;
		return fn(el, scopeProxy, local);
	};
}
__name(dynamicFunction, "dynamicFunction");
function mapComponents(components = {}) {
	return Object.fromEntries(
		Object.entries(components).map(([key, value]) => {
			if (typeof value === "string") {
				return [key, { name: key, template: value }];
			}
			if (isObject(value)) {
				return [key, { name: key, ...value }];
			}
			return [key, { name: key, template: "" }];
		})
	);
}
__name(mapComponents, "mapComponents");
function classes(element, value) {
	if (!isObject(value)) {
		return void 0;
	}
	Object.entries(value).forEach(([className, condition]) => {
		element.classList.toggle(className, !!condition);
	});
}
__name(classes, "classes");
function text(element, value, modifier, args, transform) {
	element.textContent = transform(value, modifier, args) ?? "";
}
__name(text, "text");
function renderStaticList(container, array, itemName, indexName, api) {
	const fragment = document.createDocumentFragment();
	const contextData = {};
	const nodes = array.map((item, index) => {
		const node = container._template.cloneNode(true);
		fragment.appendChild(node);
		return { node, item, index };
	});
	container.appendChild(fragment);
	nodes.forEach(({ node, item, index }) => {
		contextData[itemName] = item;
		contextData[indexName] = index;
		api.context(node, contextData);
		api.setup(node);
	});
}
__name(renderStaticList, "renderStaticList");
function bindMethods(target, source, context) {
	if (!source) {
		return;
	}
	for (const [key, value] of Object.entries(source)) {
		if (typeof value === "function") {
			target[key] = value.bind(context);
		}
	}
}
__name(bindMethods, "bindMethods");
function each(container, array, api, bus, modifier) {
	const isStatic = modifier === "once" || (array == null ? void 0 : array.length) > 0 && !isObject(array[0]);
	const component2 = bus.components[container._component];
	let componentBus = bus;
	const scope = container._scope || (container._scope = container.getAttribute("scope") || "item");
	const itemName = scope;
	const indexName = `${scope}Index`;
	if (component2) {
		componentBus = {
			...bus,
			params: {
				...bus.params,
				...component2.params
			},
			methods: {
				...bus.methods
			}
		};
		bindMethods(componentBus.methods, component2.methods, componentBus);
	}
	const setup = /* @__PURE__ */ __name((node) => {
		node.els = {};
		api.setup(node, { bus: componentBus, els: node.els, elements: component2 == null ? void 0 : component2.elements });
	}, "setup");
	if (isStatic) {
		if (container._onceRendered) {
			return;
		}
		renderStaticList(container, array, itemName, indexName, { context: api.context, setup });
		container._onceRendered = true;
		return;
	}
	const nodeMap = container._nodeMap || (container._nodeMap = /* @__PURE__ */ new WeakMap());
	const children = container.children;
	const arrLength = (array == null ? void 0 : array.length) || 0;
	if (!arrLength) {
		while (container.firstChild) {
			const node = container.firstChild;
			container.dispatchEvent(new CustomEvent("destroy", {
				detail: {
					node,
					item: node._item,
					index: node._index,
					type: "each-item"
				}
			}));
			api.unprocess(node);
			node.remove();
		}
		return;
	}
	const contextData = {};
	for (let i = 0; i < arrLength; i++) {
		const item = array[i];
		const existingNode = children[i];
		if (existingNode && existingNode._item === item) {
			if (existingNode._index !== i) {
				existingNode._index = i;
				contextData[itemName] = item;
				contextData[indexName] = i;
				api.context(existingNode, contextData);
			}
			continue;
		}
		let node = nodeMap.get(item);
		if (!node) {
			node = container._template.cloneNode(true);
			nodeMap.set(item, node);
			container.insertBefore(node, children[i] || null);
			node._item = item;
			node._index = i;
			contextData[itemName] = item;
			contextData[indexName] = i;
			api.context(node, contextData);
			container.dispatchEvent(new CustomEvent("create", {
				detail: {
					node,
					item,
					index: i,
					type: "each-item"
				}
			}));
			if (!node._setupDone) {
				setup(node);
				node._setupDone = true;
			}
		} else {
			if (children[i] !== node) {
				container.insertBefore(node, children[i] || null);
			}
			const oldIndex = node._index;
			node._item = item;
			node._index = i;
			contextData[itemName] = item;
			contextData[indexName] = i;
			api.context(node, contextData);
			if (oldIndex !== i) {
				container.dispatchEvent(new CustomEvent("update", {
					detail: {
						node,
						item,
						oldIndex,
						newIndex: i,
						type: "each-item"
					}
				}));
			}
		}
	}
	while (container.children.length > arrLength) {
		const nodeToRemove = container.lastElementChild;
		container.dispatchEvent(new CustomEvent("destroy", {
			detail: {
				node: nodeToRemove,
				item: nodeToRemove._item,
				index: nodeToRemove._index,
				type: "each-item"
			}
		}));
		api.unprocess(nodeToRemove);
		nodeToRemove.remove();
	}
}
__name(each, "each");
function attr(element, value, modifier, args, transform, directive) {
	const v = transform(value, modifier, args);
	if (v !== void 0 && v !== null && v !== false) {
		element.setAttribute(directive, v);
	} else {
		element.removeAttribute(directive);
	}
}
__name(attr, "attr");
function html(element, value, modifier, args, transform) {
	element.innerHTML = transform(value, modifier, args) ?? "";
}
__name(html, "html");
function show(element, value) {
	element.style.display = value ? "" : "none";
}
__name(show, "show");
const innerDirectives = {
	class: classes,
	text,
	each,
	html,
	show,
	attr
};
function setDeepValue(obj, path, val) {
	const keys = path.split(".");
	const lastKey = keys.pop();
	const target = keys.reduce((acc, k) => acc && acc[k] ? acc[k] : acc, obj);
	if (target && target[lastKey] !== val) {
		target[lastKey] = val;
	}
}
__name(setDeepValue, "setDeepValue");
function bind(element, value, property2, args, transform, code, bus) {
	const modifiers = [...args];
	const eventType = modifiers.shift() || "input";
	const eventName = "on" + eventType;
	const modifierName = modifiers.shift();
	const modifierArgs = modifiers;
	if (element[property2] !== value && value !== void 0) {
		element[property2] = value ?? "";
	}
	if (!element._bound) {
		element._bound = {};
	}
	if (element._bound[eventName] && element._bound[eventName] !== property2) {
		log.error('Conflict "{0}" already taken by "{1}".', eventName, element._bound[eventName], element);
		return;
	}
	if (!element._bound[eventName]) {
		const handler = /* @__PURE__ */ __name(() => {
			const result = transform(
				element[property2],
				modifierName,
				modifierArgs
			);
			setDeepValue(bus.state, code, result);
		}, "handler");
		element.addEventListener(eventType, handler);
		Object.defineProperty(element, eventName, {
			get: /* @__PURE__ */ __name(() => handler, "get"),
			set: /* @__PURE__ */ __name(() => {
				log.error('Channel "{0}" is occupied by bind "{1}".', eventName, code, element);
			}, "set"),
			configurable: true,
			enumerable: true
		});
		element._bound[eventName] = property2;
	}
}
__name(bind, "bind");
function render(content) {
	const template = document.createElement("template");
	template.innerHTML = content;
	return template.content;
}
__name(render, "render");
function slots(element, node, setup) {
	if (!element._slots) {
		return;
	}
	node.querySelectorAll("slot").forEach((slot) => {
		const name = slot.getAttribute("name") || "default";
		const content = element._slots[name];
		if (content) {
			const clone = content.cloneNode(true);
			slot.replaceWith(clone);
			slot._currentClone = clone;
			if (!clone._mounted) {
				setup(clone);
				clone._mounted = true;
			}
		} else {
			slot.childNodes.length === 0 ? slot.remove() : slot.replaceWith(...slot.childNodes);
		}
	});
}
__name(slots, "slots");
function dispatchEvent(element, name, detail, done) {
	const event = new CustomEvent(name, { detail });
	event.done = done;
	element.dispatchEvent(event);
}
__name(dispatchEvent, "dispatchEvent");
function component(element, value = {}, api, bus) {
	if (element._abortController) {
		element._abortController.abort();
	}
	const controller = new AbortController();
	element._abortController = controller;
	const remove = /* @__PURE__ */ __name((node2) => {
		while (node2.firstChild) {
			api.unprocess(node2.firstChild, node2.els);
			node2.firstChild.remove();
		}
	}, "remove");
	if (element._component) {
		dispatchEvent(element, "destroy", { name: element._component });
		remove(element);
	}
	if (!value || !value.template) {
		element.innerHTML = "";
		return;
	}
	element.els = {};
	const componentBus = {
		...bus,
		params: {
			...bus.params,
			...value.params
		},
		methods: {
			...bus.methods
		}
	};
	bindMethods(componentBus.methods, value.methods, componentBus);
	const setup = /* @__PURE__ */ __name((node2) => {
		api.setup(node2, { bus: componentBus, els: element.els, elements: value.elements });
	}, "setup");
	const node = render(value.template);
	element._component = value.name;
	if (element._hasEach) {
		slots(element, node, setup);
		const template = node.firstElementChild;
		if (template) {
			element._template = template;
			element.innerHTML = "";
		}
		return;
	}
	const start = /* @__PURE__ */ __name(() => {
		if (controller.signal.aborted) {
			return;
		}
		slots(element, node, setup);
		remove(element);
		element.appendChild(node);
		Array.from(element.children).forEach((child) => {
			setup(child);
		});
	}, "start");
	if (element._async) {
		dispatchEvent(element, "create", { name: value.name, signal: controller.signal }, start);
	} else {
		start();
		dispatchEvent(element, "create", { name: value.name });
	}
}
__name(component, "component");
function property(element, value, modifier, args, transform, directive) {
	if (isObject(value)) {
		Object.assign(element[directive], value);
		return;
	}
	const v = transform(value, modifier, args);
	if (typeof element[directive] === "boolean") {
		element[directive] = Boolean(v);
	} else {
		element[directive] = v ?? "";
	}
}
__name(property, "property");
const _Directives = class _Directives {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { object } bus
	 * @param { object } api
	 */
	constructor(clientDirectives = {}, bus, api) {
		this.api = api;
		this.directives = {
			...clientDirectives,
			...innerDirectives,
			each: /* @__PURE__ */ __name((element, value, modifier) => each(element, value, api, bus, modifier), "each"),
			component: /* @__PURE__ */ __name((element, value) => component(element, value, api, bus), "component"),
			bind: /* @__PURE__ */ __name((element, value, modifier, args, transform, directive, code) => bind(element, value, modifier, args, transform, code, bus), "bind")
		};
	}
	/**
	 * @param { HTMLElement } element
	 * @param { string } key
	 * @param { any } value
	 * @param { string } code
	 */
	apply(element, key, value, code) {
		const [directive, modifier, ...args] = key.split(".");
		if (key === "el") {
			return;
		}
		if (Object.hasOwn(this.directives, directive)) {
			this.directives[directive](element, value, modifier, args, this.api.transform, directive, code);
			return;
		}
		if (directive in element) {
			property(element, value, modifier, args, this.api.transform, directive);
			return;
		}
		attr(element, value, modifier, args, this.api.transform, directive);
	}
};
__name(_Directives, "Directives");
let Directives = _Directives;
const defaultModifiers = {
	/**
	 * @param { any } value
	 * @param { number } [n=2]
	 * @returns { string }
	 */
	fixed: /* @__PURE__ */ __name((value, n = 2) => Number(value).toFixed(n), "fixed"),
	/**
	 * @param { any } value
	 * @param { number } [n=10]
	 * @returns { number }
	 */
	int: /* @__PURE__ */ __name((value, n = 10) => parseInt(value, n), "int"),
	/**
	 * @param { any } value
	 * @returns { number }
	 */
	abs: /* @__PURE__ */ __name((value) => Math.abs(Number(value)), "abs"),
	/**
	 * @param { any } value
	 * @returns { number }
	 */
	round: /* @__PURE__ */ __name((value) => Math.round(Number(value)), "round"),
	/**
	 * @param { any } value
	 * @param { number } [min=0]
	 * @param { number } [max=1]
	 * @returns { number }
	 */
	clamp: /* @__PURE__ */ __name((value, min = 0, max = 1) => Math.min(Math.max(Number(value), min), max), "clamp"),
	/**
	 * @param { any } value
	 * @param { string } [u='px']
	 * @returns { string }
	 */
	unit: /* @__PURE__ */ __name((value, u = "px") => value + u, "unit"),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	trim: /* @__PURE__ */ __name((value) => String(value).trim(), "trim"),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	upper: /* @__PURE__ */ __name((value) => String(value).toUpperCase(), "upper"),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	lower: /* @__PURE__ */ __name((value) => String(value).toLowerCase(), "lower"),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	capitalize: /* @__PURE__ */ __name((value) => String(value).charAt(0).toUpperCase() + String(value).slice(1), "capitalize"),
	/**
	 * @param { any } value
	 * @param { string } [def='-']
	 * @returns { any }
	 */
	default: /* @__PURE__ */ __name((value, def = "-") => value || value === 0 ? value : def, "default"),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	json: /* @__PURE__ */ __name((value) => JSON.stringify(value), "json")
};
const _Modifiers = class _Modifiers {
	/**
	 * @param { object } clientModifiers
	 */
	constructor(clientModifiers = {}) {
		/** @type { Record<string, Function> } */
		__publicField(this, "modifiers");
		this.modifiers = { ...defaultModifiers, ...clientModifiers };
	}
	/**
	 * @param { any } value
	 * @param { string } name
	 * @param  { Array<string> } args
	 * @returns { any }
	 */
	transform(value, name, args) {
		if (!name) {
			return value;
		}
		if (Object.hasOwn(this.modifiers, name)) {
			return this.modifiers[name](value, ...args);
		}
		log.error(`Unknown modifier '${name}'`);
		return value;
	}
};
__name(_Modifiers, "Modifiers");
let Modifiers = _Modifiers;
const _Reactivity = class _Reactivity {
	constructor() {
		__publicField(this, "activeEffect", null);
		__privateAdd(this, _storage, /* @__PURE__ */ new WeakMap());
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 * @param { Function } effect
	 */
	add(target, key, effect) {
		if (!__privateGet(this, _storage).has(target)) {
			__privateGet(this, _storage).set(target, /* @__PURE__ */ new Map());
		}
		const keysMap = __privateGet(this, _storage).get(target);
		if (!keysMap.has(key)) {
			keysMap.set(key, /* @__PURE__ */ new Set());
		}
		keysMap.get(key).add(effect);
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 * @returns { Array<{el: HTMLElement, attr: string, update: Function}> }
	 */
	find(target, key) {
		const keysMap = __privateGet(this, _storage).get(target);
		const effects = keysMap == null ? void 0 : keysMap.get(key);
		return effects ? Array.from(effects) : [];
	}
	/**
	 * @param {Function} effect
	 * @param {object} deps
	 */
	removeEffect(effect, deps) {
		if (!deps) {
			return;
		}
		for (const dep of deps) {
			const { target, property: property2 } = dep;
			const keysMap = __privateGet(this, _storage).get(target);
			if (keysMap) {
				const effects = keysMap.get(property2);
				if (effects) {
					effects.delete(effect);
					if (effects.size === 0) {
						keysMap.delete(property2);
					}
				}
				if (keysMap.size === 0) {
					__privateGet(this, _storage).delete(target);
				}
			}
		}
		deps.clear();
	}
	/**
	 * @param {HTMLElement} element
	 */
	removeEffects(element) {
		if (!element._effects) {
			return;
		}
		for (const effect of element._effects) {
			this.removeEffect(effect, effect.deps);
		}
		element._effects.clear();
	}
};
_storage = new WeakMap();
__name(_Reactivity, "Reactivity");
let Reactivity = _Reactivity;
const _Listeners = class _Listeners {
	/**
	 *
	 */
	constructor() {
		__privateAdd(this, _storage2);
		__privateSet(this, _storage2, /* @__PURE__ */ new Map());
	}
	/**
	 * @param { HTMLElement } element
	 * @param { string } attr
	 * @param { Function } handle
	 */
	add(element, attr2, handle) {
		if (!__privateGet(this, _storage2).has(element)) {
			__privateGet(this, _storage2).set(element, []);
		}
		const [name, ...mods] = attr2.split(".");
		const options = {
			once: mods.includes("once"),
			capture: mods.includes("capture"),
			passive: mods.includes("passive")
		};
		let handler = /* @__PURE__ */ __name((event) => {
			if (mods.includes("stop")) {
				event.stopPropagation();
			}
			if (mods.includes("prevent")) {
				event.preventDefault();
			}
			if (mods.includes("self") && event.target !== element) {
				return;
			}
			if (mods.includes("enter") && event.key !== "Enter") {
				return;
			}
			handle(event);
		}, "handler");
		if (name === "create") {
			if (mods.includes("async")) {
				element._async = true;
			}
			handler = /* @__PURE__ */ __name(async (event) => {
				var _a;
				const { detail, timestamp, done } = event;
				const h = handle({ name: detail.name, target: element, timestamp, signal: detail.signal });
				try {
					element._async ? await h : h;
				} catch (error) {
					if ((_a = detail.signal) == null ? void 0 : _a.aborted) {
						return;
					}
					log.error('Failed to execute "{0}" listener in component <{1}>.', ":oncreate", detail.name);
					throw error;
				} finally {
					done();
				}
			}, "handler");
		} else if (name === "destroy") {
			handler = /* @__PURE__ */ __name((event) => {
				const { detail } = event;
				handle({ name: detail.name, target: element });
			}, "handler");
		}
		const listener = { name, handler, options };
		__privateGet(this, _storage2).get(element).push(listener);
		element.addEventListener(name, handler, options);
	}
	/**
	 * @param { HTMLElement } element
	 */
	remove(element) {
		const listeners = __privateGet(this, _storage2).get(element);
		if (listeners) {
			listeners.forEach(({ name, handler, options }) => {
				element.removeEventListener(name, handler, options);
			});
			__privateGet(this, _storage2).delete(element);
		}
	}
};
_storage2 = new WeakMap();
__name(_Listeners, "Listeners");
let Listeners = _Listeners;
function kebabToCamel(str) {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
__name(kebabToCamel, "kebabToCamel");
const DIRECTIVE_PRIORITY = {
	"props": 1,
	"component": 2,
	"component.async": 3,
	"each": 4,
	"each.once": 5
};
function priority(key) {
	const cleanKey = key.startsWith(":") ? key.slice(1) : key;
	if (cleanKey === "el") {
		return -1;
	}
	if (DIRECTIVE_PRIORITY[cleanKey] !== void 0) {
		return DIRECTIVE_PRIORITY[cleanKey];
	}
	const base = cleanKey.split(".")[0];
	if (DIRECTIVE_PRIORITY[base] !== void 0) {
		return DIRECTIVE_PRIORITY[base];
	}
	return 100;
}
__name(priority, "priority");
const _Nodes = class _Nodes {
	/**
	 * @param { object } options
	 * @param { Function } options.listeners
	 * @param { Function } options.destroy
	 */
	constructor({ listeners, destroy, attribute }) {
		this.listeners = listeners;
		this.destroy = destroy;
		this.attribute = attribute;
		this.nodes = /* @__PURE__ */ new WeakSet();
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } component
	 * @param { Function } handler
	 */
	// eslint-disable-next-line sonarjs/cognitive-complexity
	process(node, component2, handler) {
		const stack = [node];
		while (stack.length) {
			const current = stack.pop();
			if (current.nodeType === 1 || current.nodeType === 11) {
				let hasDirectives = false;
				if (current.nodeType === 1) {
					const attrs = Array.from(current.attributes);
					attrs.sort((a, b) => {
						return priority(a.name) - priority(b.name);
					});
					const toRemove = [];
					for (let i = 0; i < attrs.length; i++) {
						const attr2 = attrs[i];
						this.attribute(current, attr2.name, attr2.value, component2);
						if (attr2.name.charCodeAt(0) === 58) {
							hasDirectives = true;
							this.directive(attr2, current, handler, toRemove, component2);
						} else if (attr2.name === "el") {
							hasDirectives = true;
						}
					}
					for (const attrName of toRemove) {
						current.removeAttribute(attrName);
					}
					if (hasDirectives) {
						this.nodes.add(current);
					}
				}
				let child = current.lastElementChild;
				while (child) {
					stack.push(child);
					child = child.previousElementSibling;
				}
			}
		}
	}
	/**
	 * @param { string } attr
	 * @param { HTMLElement } node
	 * @param { Function } handler
	 * @param { Array } toRemove
	 * @param { object } component
	 */
	directive(attr2, node, handler, toRemove, component2) {
		const name = attr2.name.slice(1);
		const key = kebabToCamel(name);
		if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
			this.listeners(node, key.slice(2).toLowerCase(), attr2.value, component2);
		} else {
			handler(node, key, attr2.value);
		}
		toRemove.push(attr2.name);
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } els
	 */
	unprocess(node, els) {
		const stack = [node];
		while (stack.length) {
			const current = stack.pop();
			if (current._keep) {
				continue;
			}
			if (this.nodes.has(current)) {
				this.destroy(current, els);
				this.nodes.delete(current);
			}
			let child = current.firstElementChild;
			while (child) {
				stack.push(child);
				child = child.nextElementSibling;
			}
		}
	}
};
__name(_Nodes, "Nodes");
let Nodes = _Nodes;
function prepareElement(element, key, directives = {}) {
	if (key === "each" || key.startsWith("each.")) {
		const hasContent = element.firstElementChild || element.textContent.trim() !== "";
		if (hasContent) {
			if (!element.hasAttribute(":component") && !element._component && !directives.component) {
				element._template = element.firstElementChild.cloneNode(true);
				element.innerHTML = "";
			} else {
				log.error("Content (slots) is not allowed inside the :each directive.", element);
			}
		}
		return;
	}
	if (key === "component" || key.startsWith("component.")) {
		element._hasEach = element.hasAttribute(":each") || element.hasAttribute(":each.once") || element._hasEach || !!directives.each || !!directives["each.once"];
		if (element._slots) {
			return;
		}
		element._slots = {};
		Array.from(element.childNodes).forEach((node) => {
			if (node.nodeType === 3 && !node.textContent.trim()) {
				node.remove();
				return;
			}
			const name = node.nodeType === 1 && node.getAttribute("slot") || "default";
			if (element._slots[name]) {
				log.error('Slot "{0}" is already occupied in component', name, element);
				return;
			}
			node._keep = true;
			element._slots[name] = node;
			node.remove();
		});
	}
}
__name(prepareElement, "prepareElement");
function bindAdvanced(element, key, binding, args, transform) {
	const [_, property2, ...modifiers] = key.split(".");
	const eventType = modifiers[0] || "input";
	const eventName = "on" + eventType;
	const modifierName = modifiers[1] || null;
	const modifierArgs = modifiers.slice(2);
	const rawValue = binding.get.call(args);
	const transformedValue = transform(rawValue, modifierName, modifierArgs);
	if (element[property2] !== transformedValue && transformedValue !== void 0) {
		element[property2] = transformedValue ?? "";
	}
	if (!element._bound) {
		element._bound = {};
	}
	if (element._bound[eventName] && element._bound[eventName] !== property2) {
		log.error('Conflict "{0}" already taken by "{1}".', eventName, element._bound[eventName], element);
		return;
	}
	if (!element._bound[eventName]) {
		const handler = /* @__PURE__ */ __name(() => {
			binding.set.call(args, transform(element[property2], modifierName, modifierArgs));
		}, "handler");
		element.addEventListener(eventType, handler);
		Object.defineProperty(element, eventName, {
			get: /* @__PURE__ */ __name(() => handler, "get"),
			set: /* @__PURE__ */ __name(() => {
				log.error('Channel "{0}" is occupied by bind "{1}".', eventName, property2, element);
			}, "set"),
			configurable: true,
			enumerable: true
		});
		element._bound[eventName] = property2;
	}
}
__name(bindAdvanced, "bindAdvanced");
const IS_PROXY = Symbol("is_proxy");
const _Prototy = class _Prototy {
	/**
	 * @param { PrototyOptions } options
	 */
	constructor({
		            state = {},
		            root = document.body,
		            params = {},
		            methods = {},
		            computed = {},
		            directives = {},
		            modifiers = {},
		            elements = {},
		            components = {},
		            setters = {},
		            created,
		            ready
	            }) {
		this.reactivity = new Reactivity();
		this.listeners = new Listeners();
		this.contextStorage = /* @__PURE__ */ new WeakMap();
		this.pendingTargets = /* @__PURE__ */ new Map();
		this.initComputed(state, computed);
		this.state = this.createProxy(state);
		this.methods = {};
		this.setters = {};
		this.activeSetters = /* @__PURE__ */ new Set();
		this.bus = {
			root,
			state: this.state,
			methods: this.methods,
			params,
			components: mapComponents(components),
			els: {}
		};
		bindMethods(this.methods, methods, this.bus);
		bindMethods(this.setters, setters, this.bus);
		this.nodes = new Nodes({
			listeners: /* @__PURE__ */ __name((element, key, value, component2) => {
				const func = dynamicFunction(value, component2.bus, component2.els, "event");
				this.listeners.add(element, key, (event) => {
					const ctx = this.getContext(element);
					return func(element, ctx, event);
				});
			}, "listeners"),
			destroy: this.destroy.bind(this),
			attribute: /* @__PURE__ */ __name((element, key, value, component2) => {
				var _a;
				if (key.startsWith(":")) {
					const cleanKey = key.slice(1);
					prepareElement(element, cleanKey);
				}
				if (key === "el") {
					const camelName = kebabToCamel(value);
					element._el = camelName;
					component2.els[camelName] = element;
					this.functionality(element, (_a = component2.elements) == null ? void 0 : _a[camelName], component2);
				}
				if (key === "component") {
					this.bus.components[value] = { name: value, template: element.tagName === "TEMPLATE" ? element.innerHTML.trim() : element.outerHTML, element };
				}
			}, "attribute")
		});
		this.modifiers = new Modifiers(modifiers);
		this.directive = new Directives(directives, this.bus, {
			setup: this.setup.bind(this),
			unprocess: this.nodes.unprocess.bind(this.nodes),
			context: this.updateContext.bind(this),
			transform: this.modifiers.transform.bind(this.modifiers)
		});
		created == null ? void 0 : created.call(this.bus);
		this.setup(root, { bus: this.bus, els: this.bus.els, elements });
		ready == null ? void 0 : ready.call(this.bus);
	}
	/**
	 * @param { HTMLElement } element
	 * @param { object } directives
	 * @param { object } component
	 */
	functionality(element, directives, component2) {
		if (!directives) {
			return;
		}
		const ctx = this.getContext(element, true);
		const sortedKeys = Object.keys(directives).sort((a, b) => {
			return priority(a) - priority(b);
		});
		for (const key of sortedKeys) {
			const fn = directives[key];
			if (typeof fn !== "function") {
				continue;
			}
			prepareElement(element, key, directives);
			const args = {
				el: element,
				els: component2.els,
				props: ctx
			};
			if (key === "props") {
				const updateProps = /* @__PURE__ */ __name(() => {
					this.reactivity.removeEffect(updateProps, updateProps.deps);
					this.reactivity.activeEffect = updateProps;
					try {
						const freshCtx = this.getContext(element, true);
						const freshArgs = {
							el: element,
							els: component2.els,
							props: freshCtx
						};
						const result = fn.call(component2.bus, freshArgs);
						this.updateContext(element, result);
					} catch {
						log.error("Error applying props in elements", key, element);
					} finally {
						this.reactivity.activeEffect = null;
					}
				}, "updateProps");
				updateProps.deps = /* @__PURE__ */ new Set();
				updateProps();
				if (!element._effects) {
					element._effects = /* @__PURE__ */ new Set();
				}
				element._effects.add(updateProps);
				continue;
			}
			if (key.startsWith("on")) {
				const eventName = key.slice(2);
				this.listeners.add(element, eventName, (event) => {
					try {
						fn.call(component2.bus, { ...args, event });
					} catch {
						log.error("Error in event handler", key, element);
					}
				});
				continue;
			}
			const update = /* @__PURE__ */ __name(() => {
				this.reactivity.removeEffect(update, update.deps);
				this.reactivity.activeEffect = update;
				try {
					const freshCtx = this.getContext(element, true);
					const freshArgs = {
						el: element,
						els: component2.els,
						props: freshCtx
					};
					const result = fn.call(component2.bus, freshArgs);
					if (result && typeof result === "object" && "get" in result && "set" in result) {
						bindAdvanced(element, key, result, freshArgs, this.directive.api.transform);
					} else {
						this.directive.apply(element, key, result, result);
					}
				} finally {
					this.reactivity.activeEffect = null;
				}
			}, "update");
			update.deps = /* @__PURE__ */ new Set();
			update();
			if (!element._effects) {
				element._effects = /* @__PURE__ */ new Set();
			}
			element._effects.add(update);
			if (!element._applied) {
				element._applied = /* @__PURE__ */ new Set();
			}
			element._applied.add(key.split(".")[0]);
		}
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } component
	 */
	setup(node, component2) {
		this.nodes.process(node, component2, (element, key, code) => {
			if (element._applied && element._applied.has(key.split(".")[0])) {
				log.warn('Directive "{0}" on element "{1}" is already defined in elements. HTML directive will be ignored.', key, element._el);
				return;
			}
			const func = dynamicFunction(code, component2.bus, component2.els);
			const update = /* @__PURE__ */ __name(() => {
				this.reactivity.removeEffect(update, update.deps);
				this.reactivity.activeEffect = update;
				try {
					const ctx = this.getContext(element);
					const res = func(element, ctx);
					if (key === "props") {
						this.updateContext(element, res);
					} else {
						this.directive.apply(element, key, res, code);
					}
				} finally {
					this.reactivity.activeEffect = null;
				}
			}, "update");
			if (!element._effects) {
				element._effects = /* @__PURE__ */ new Set();
			}
			element._effects.add(update);
			update.deps = /* @__PURE__ */ new Set();
			update();
		});
	}
	/**
	 * @param { object } rawState
	 * @param { Record<string, Function> } computed
	 */
	initComputed(rawState, computed) {
		if (!computed || Object.keys(computed).length === 0) {
			return;
		}
		Object.keys(computed).forEach((key) => {
			if (key in rawState) {
				log.warn('Computed property "{0}" overrides existing property', key);
			}
			const getter = computed[key];
			let cachedValue;
			let isDirty = true;
			const computedEffect = /* @__PURE__ */ __name(() => {
				if (!isDirty) {
					isDirty = true;
					this.schedule(rawState, key);
				}
			}, "computedEffect");
			computedEffect.deps = /* @__PURE__ */ new Set();
			Object.defineProperty(rawState, key, {
				get: /* @__PURE__ */ __name(() => {
					if (this.reactivity.activeEffect === computedEffect) {
						log.error('Circular dependency detected in computed property "{0}"', key);
						return cachedValue;
					}
					const activeEffect = this.reactivity.activeEffect;
					if (activeEffect && activeEffect !== computedEffect) {
						this.reactivity.add(rawState, key, activeEffect);
						activeEffect.deps.add({ target: rawState, property: key });
					}
					if (isDirty) {
						const prevEffect = this.reactivity.activeEffect;
						if (computedEffect.deps.size > 0) {
							this.reactivity.removeEffect(computedEffect, computedEffect.deps);
							computedEffect.deps.clear();
						}
						this.reactivity.activeEffect = computedEffect;
						try {
							cachedValue = getter.bind(this.bus)();
						} catch (e) {
							log.error('Error in computed property "{0}": {1}', key, e.message);
							cachedValue = void 0;
						} finally {
							this.reactivity.activeEffect = prevEffect;
						}
						isDirty = false;
					}
					return cachedValue;
				}, "get"),
				enumerable: true,
				configurable: true
			});
		});
	}
	/**
	 * @param { any } state
	 * @param { string } path
	 * @param { string } parent
	 * @returns { object }
	 */
	createProxy(state, path = "", parent = null) {
		const self = this;
		if (isObject(state)) {
			Object.keys(state).forEach((key) => {
				const descriptor = Object.getOwnPropertyDescriptor(state, key);
				if (descriptor && typeof descriptor.get === "function") {
					return;
				}
				if (isObject(state[key])) {
					state[key] = this.createProxy(
						state[key],
						path ? `${path}.${key}` : key,
						state
					);
				}
			});
		}
		if (path) {
			Object.defineProperty(state, "_path", {
				value: path,
				enumerable: false,
				writable: true,
				configurable: true
			});
			Object.defineProperty(state, "_parent", {
				value: parent,
				enumerable: false,
				writable: true,
				configurable: true
			});
		}
		Object.defineProperty(state, IS_PROXY, {
			value: true,
			enumerable: false,
			writable: false,
			configurable: false
		});
		Object.defineProperty(state, "_lastSegment", {
			value: path ? path.split(".").pop() : null,
			enumerable: false,
			writable: false,
			configurable: false
		});
		return new Proxy(state, {
			get(target, property2, receiver) {
				if (property2 === IS_PROXY) {
					return true;
				}
				const value = Reflect.get(target, property2, receiver);
				const isObservable = typeof property2 !== "symbol" && property2 in target && typeof value !== "function";
				const activeEffect = self.reactivity.activeEffect;
				if (isObservable && activeEffect) {
					self.reactivity.add(target, property2, activeEffect);
					activeEffect.deps.add({ target, property: property2 });
				}
				return value;
			},
			// eslint-disable-next-line sonarjs/cognitive-complexity
			set(target, property2, value, receiver) {
				var _a;
				if (typeof property2 === "symbol") {
					return Reflect.set(target, property2, value, receiver);
				}
				const descriptor = Object.getOwnPropertyDescriptor(target, property2);
				if (descriptor && typeof descriptor.get === "function" && typeof descriptor.set !== "function") {
					log.error('Computed property "{0}" is readonly.', property2.toString());
					return false;
				}
				const isArray = Array.isArray(target);
				const oldValue = Reflect.get(target, property2);
				const isLength = isArray && property2 === "length";
				if (!isLength && Object.is(oldValue, value)) {
					return true;
				}
				const fullPath = path ? `${path}.${property2.toString()}` : property2.toString();
				let newValue = value;
				if (isObject(value) && !(value instanceof Date) && !value[IS_PROXY]) {
					newValue = self.createProxy(value, fullPath);
				}
				if (typeof ((_a = self.setters) == null ? void 0 : _a[fullPath]) === "function" && !self.activeSetters.has(fullPath)) {
					self.activeSetters.add(fullPath);
					try {
						newValue = self.setters[fullPath](newValue, oldValue);
						if (Object.is(oldValue, newValue)) {
							return true;
						}
					} catch (e) {
						log.error('Error in setter for "{0}": {1}', fullPath, e.message);
						newValue = oldValue;
					} finally {
						self.activeSetters.delete(fullPath);
					}
				}
				const success = Reflect.set(target, property2, newValue, receiver);
				if (success) {
					self.schedule(target, property2);
					if (isArray && !isLength) {
						self.schedule(target, "length");
					}
				}
				return success;
			}
		});
	}
	/**
	 * @param { object } target
	 * @param { string } property
	 */
	schedule(target, property2) {
		const addToPending = /* @__PURE__ */ __name((obj, prop) => {
			if (!this.pendingTargets.has(obj)) {
				this.pendingTargets.set(obj, /* @__PURE__ */ new Set());
				queueMicrotask(() => {
					const changedKeys = this.pendingTargets.get(obj);
					this.pendingTargets.delete(obj);
					const uniqueEffects = /* @__PURE__ */ new Set();
					changedKeys.forEach((key) => {
						const effects = this.reactivity.find(obj, key);
						effects.forEach((eff) => uniqueEffects.add(eff));
						const value = obj[key];
						if (value && value._path) {
							const pathEffects = this.reactivity.find(obj, value._path);
							pathEffects.forEach((eff) => uniqueEffects.add(eff));
						}
					});
					uniqueEffects.forEach((update) => {
						if (update !== this.reactivity.activeEffect) {
							update();
						}
					});
				});
			}
			this.pendingTargets.get(obj).add(prop);
		}, "addToPending");
		addToPending(target, property2);
		let current = target;
		while (current && current._parent) {
			const parentProperty = current._lastSegment;
			if (parentProperty) {
				addToPending(current._parent, parentProperty);
			}
			current = current._parent;
		}
	}
	/**
	 * @param { HTMLElement } element
	 * @param { boolean } reactive
	 * @returns { any }
	 */
	getContext(element, reactive = true) {
		const self = this;
		const activeEffect = reactive ? this.reactivity.activeEffect : null;
		return new Proxy({}, {
			get(_, prop) {
				let current = element;
				while (current) {
					const entry = self.contextStorage.get(current);
					if ((entry == null ? void 0 : entry.data) && prop in entry.data) {
						if (activeEffect) {
							const contextKey = `ctx:${String(prop)}`;
							self.reactivity.add(current, contextKey, activeEffect);
							activeEffect.deps.add({ target: current, property: contextKey });
						}
						return entry.data[prop];
					}
					current = current.parentElement;
				}
				return void 0;
			},
			has: /* @__PURE__ */ __name(() => true, "has")
		});
	}
	/**
	 * @param { HTMLElement } element
	 * @param { any } newValue
	 */
	updateContext(element, newValue) {
		let entry = this.contextStorage.get(element);
		if (!entry) {
			entry = { data: {}, isScope: false };
			this.contextStorage.set(element, entry);
		}
		for (const key in newValue) {
			const val = newValue[key];
			const oldVal = entry.data[key];
			if (oldVal !== val) {
				entry.data[key] = val;
				const contextKey = `ctx:${key}`;
				const effects = this.reactivity.find(element, contextKey);
				effects.forEach((effect) => {
					if (effect !== this.reactivity.activeEffect) {
						effect();
					}
				});
			}
		}
	}
	/**
	 * @param { HTMLElement } element
	 * @param { object } els
	 */
	destroy(element, els = null) {
		if (element._el && els) {
			delete els[element._el];
		}
		for (const child of Array.from(element.children)) {
			this.destroy(child, element.els || null);
		}
		this.listeners.remove(element);
		this.reactivity.removeEffects(element);
		unbind(element);
		if (element.els) {
			element.els = {};
		}
	}
};
__name(_Prototy, "Prototy");
let Prototy_old = _Prototy;
function nextTick(callback) {
	const wait = /* @__PURE__ */ __name(() => new Promise((resolve) => {
		queueMicrotask(() => {
			requestAnimationFrame(() => {
				resolve();
			});
		});
	}), "wait");
	if (callback) {
		return wait().then(callback);
	}
	return wait();
}
__name(nextTick, "nextTick");
function isEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}
__name(isEqual, "isEqual");
function prototy(options) {
	const p = new Prototy_old(options);
	let isDestroyed = false;
	return {
		...p.bus,
		destroy: /* @__PURE__ */ __name(() => {
			var _a, _b;
			if (isDestroyed) {
				return;
			}
			p.destroy(p.bus.root);
			(_a = p.pendingTargets) == null ? void 0 : _a.clear();
			(_b = p.activeSetters) == null ? void 0 : _b.clear();
			p.bus = null;
			isDestroyed = true;
		}, "destroy")
	};
}
__name(prototy, "prototy");
export {
	isEqual,
	isObject,
	kebabToCamel,
	nextTick,
	prototy
};
