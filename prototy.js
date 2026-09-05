var q = Object.defineProperty;
var L = (e) => {
	throw TypeError(e);
};
var F = (e, t, s) => t in e ? q(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var T = (e, t, s) => F(e, typeof t != "symbol" ? t + "" : t, s), D = (e, t, s) => t.has(e) || L("Cannot " + s);
var E = (e, t, s) => (D(e, t, "read from private field"), s ? s.call(e) : t.get(e)), M = (e, t, s) => t.has(e) ? L("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), R = (e, t, s, i) => (D(e, t, "write to private field"), i ? i.call(e, s) : t.set(e, s), s);
function C(e) {
	return typeof e == "object" && e !== null;
}
function z(e) {
	if (e._bound) {
		for (const t in e._bound)
			delete e[t];
		delete e._bound;
	}
}
const _ = {
	/**
	 * @param { string } text
	 * @param { Array } [args=[]]
	 */
	error(e, ...t) {
	},
	warn(e, ...t) {
	}
};
function $(e, t, s, i = "") {
	const o = i ? `const ${i} = local` : "", n = new Function("el", "scope", "local", `
        ${o}
        with(scope) {
            try {
                return ${e}
            } catch (err) {
                console.warn('Runtime error in expression:', err)
                return undefined
            }
        }
    `);
	return (r, c, u) => {
		const f = new Proxy({}, {
			get(a, d) {
				if (d === "el")
					return r;
				const p = c[d];
				if (p !== void 0)
					return p;
				if (d in t.state)
					return t.state[d];
				if (d in t.methods)
					return t.methods[d];
				if (d in t.params)
					return t.params[d];
				if (d === "root")
					return t.root;
				if (d === "components")
					return t.components;
				if (d === "els")
					return s;
				if (d !== Symbol.unscopables) {
					if (d in window)
						return window[d];
					_.error('ReferenceError: "{0}" is not defined', d, r);
				}
			},
			set(a, d, p) {
				return d in t.state ? (t.state[d] = p, !0) : c && typeof c == "object" && d in c ? (c[d] = p, !0) : (_.error(`Cannot set "${d}" - property does not exist in state or context`, r), !1);
			},
			has(a, d) {
				return d !== i;
			}
		});
		return n(r, f, u);
	};
}
function B(e = {}) {
	return Object.fromEntries(
		Object.entries(e).map(([t, s]) => typeof s == "string" ? [t, { name: t, template: s }] : C(s) ? [t, { name: t, ...s }] : [t, { name: t, template: "" }])
	);
}
function U(e, t) {
	C(t) && Object.entries(t).forEach(([s, i]) => {
		e.classList.toggle(s, !!i);
	});
}
function J(e, t, s, i, o) {
	e.textContent = o(t, s, i) ?? "";
}
function Y(e, t, s, i, o) {
	const n = document.createDocumentFragment(), r = {}, c = t.map((u, f) => {
		const a = e._template.cloneNode(!0);
		return n.appendChild(a), { node: a, item: u, index: f };
	});
	e.appendChild(n), c.forEach(({ node: u, item: f, index: a }) => {
		r[s] = f, r[i] = a, o.context(u, r), o.setup(u);
	});
}
function O(e, t, s) {
	if (t)
		for (const [i, o] of Object.entries(t))
			typeof o == "function" && (e[i] = o.bind(s));
}
function H(e, t, s, i, o) {
	const n = o === "once" || (t == null ? void 0 : t.length) > 0 && !C(t[0]), r = i.components[e._component];
	let c = i;
	const u = e._scope || (e._scope = e.getAttribute("scope") || "item"), f = u, a = `${u}Index`;
	r && (c = {
		...i,
		params: {
			...i.params,
			...r.params
		},
		methods: {
			...i.methods
		}
	}, O(c.methods, r.methods, c));
	const d = (h) => {
		h.els = {}, s.setup(h, { bus: c, els: h.els, elements: r == null ? void 0 : r.elements });
	};
	if (n) {
		if (e._onceRendered)
			return;
		Y(e, t, f, a, { context: s.context, setup: d }), e._onceRendered = !0;
		return;
	}
	const p = e._nodeMap || (e._nodeMap = /* @__PURE__ */ new WeakMap()), l = e.children, g = (t == null ? void 0 : t.length) || 0;
	if (!g) {
		for (; e.firstChild; ) {
			const h = e.firstChild;
			e.dispatchEvent(new CustomEvent("destroy", {
				detail: {
					node: h,
					item: h._item,
					index: h._index,
					type: "each-item"
				}
			})), s.unprocess(h), h.remove();
		}
		return;
	}
	const b = {};
	for (let h = 0; h < g; h++) {
		const v = t[h], m = l[h];
		if (m && m._item === v) {
			m._index !== h && (m._index = h, b[f] = v, b[a] = h, s.context(m, b));
			continue;
		}
		let y = p.get(v);
		if (!y)
			y = e._template.cloneNode(!0), p.set(v, y), e.insertBefore(y, l[h] || null), y._item = v, y._index = h, b[f] = v, b[a] = h, s.context(y, b), e.dispatchEvent(new CustomEvent("create", {
				detail: {
					node: y,
					item: v,
					index: h,
					type: "each-item"
				}
			})), y._setupDone || (d(y), y._setupDone = !0);
		else {
			l[h] !== y && e.insertBefore(y, l[h] || null);
			const j = y._index;
			y._item = v, y._index = h, b[f] = v, b[a] = h, s.context(y, b), j !== h && e.dispatchEvent(new CustomEvent("update", {
				detail: {
					node: y,
					item: v,
					oldIndex: j,
					newIndex: h,
					type: "each-item"
				}
			}));
		}
	}
	for (; e.children.length > g; ) {
		const h = e.lastElementChild;
		e.dispatchEvent(new CustomEvent("destroy", {
			detail: {
				node: h,
				item: h._item,
				index: h._index,
				type: "each-item"
			}
		})), s.unprocess(h), h.remove();
	}
}
function V(e, t, s, i, o, n) {
	const r = o(t, s, i);
	r != null && r !== !1 ? e.setAttribute(n, r) : e.removeAttribute(n);
}
function X(e, t, s, i, o) {
	e.innerHTML = o(t, s, i) ?? "";
}
function G(e, t) {
	e.style.display = t ? "" : "none";
}
const Q = {
	class: U,
	text: J,
	each: H,
	html: X,
	show: G,
	attr: V
};
function Z(e, t, s) {
	const i = t.split("."), o = i.pop(), n = i.reduce((r, c) => r && r[c] ? r[c] : r, e);
	n && n[o] !== s && (n[o] = s);
}
function k(e, t, s, i, o, n, r) {
	const c = [...i], u = c.shift() || "input", f = "on" + u, a = c.shift(), d = c;
	if (e[s] !== t && t !== void 0 && (e[s] = t ?? ""), e._bound || (e._bound = {}), e._bound[f] && e._bound[f] !== s) {
		_.error('Conflict "{0}" already taken by "{1}".', f, e._bound[f], e);
		return;
	}
	if (!e._bound[f]) {
		const p = () => {
			const l = o(
				e[s],
				a,
				d
			);
			Z(r.state, n, l);
		};
		e.addEventListener(u, p), Object.defineProperty(e, f, {
			get: () => p,
			set: () => {
				_.error('Channel "{0}" is occupied by bind "{1}".', f, n, e);
			},
			configurable: !0,
			enumerable: !0
		}), e._bound[f] = s;
	}
}
function tt(e) {
	const t = document.createElement("template");
	return t.innerHTML = e, t.content;
}
function W(e, t, s) {
	e._slots && t.querySelectorAll("slot").forEach((i) => {
		const o = i.getAttribute("name") || "default", n = e._slots[o];
		if (n) {
			const r = n.cloneNode(!0);
			i.replaceWith(r), i._currentClone = r, r._mounted || (s(r), r._mounted = !0);
		} else
			i.childNodes.length === 0 ? i.remove() : i.replaceWith(...i.childNodes);
	});
}
function N(e, t, s, i) {
	const o = new CustomEvent(t, { detail: s });
	o.done = i, e.dispatchEvent(o);
}
function et(e, t = {}, s, i) {
	e._abortController && e._abortController.abort();
	const o = new AbortController();
	e._abortController = o;
	const n = (a) => {
		for (; a.firstChild; )
			s.unprocess(a.firstChild, a.els), a.firstChild.remove();
	};
	if (e._component && (N(e, "destroy", { name: e._component }), n(e)), !t || !t.template) {
		e.innerHTML = "";
		return;
	}
	e.els = {};
	const r = {
		...i,
		params: {
			...i.params,
			...t.params
		},
		methods: {
			...i.methods
		}
	};
	O(r.methods, t.methods, r);
	const c = (a) => {
		s.setup(a, { bus: r, els: e.els, elements: t.elements });
	}, u = tt(t.template);
	if (e._component = t.name, e._hasEach) {
		W(e, u, c);
		const a = u.firstElementChild;
		a && (e._template = a, e.innerHTML = "");
		return;
	}
	const f = () => {
		o.signal.aborted || (W(e, u, c), n(e), e.appendChild(u), Array.from(e.children).forEach((a) => {
			c(a);
		}));
	};
	e._async ? N(e, "create", { name: t.name, signal: o.signal }, f) : (f(), N(e, "create", { name: t.name }));
}
function st(e, t, s, i, o, n) {
	if (C(t)) {
		Object.assign(e[n], t);
		return;
	}
	const r = o(t, s, i);
	typeof e[n] == "boolean" ? e[n] = !!r : e[n] = r ?? "";
}
class it {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { object } bus
	 * @param { object } api
	 */
	constructor(t = {}, s, i) {
		this.api = i, this.directives = {
			...t,
			...Q,
			each: (o, n, r) => H(o, n, i, s, r),
			component: (o, n) => et(o, n, i, s),
			bind: (o, n, r, c, u, f, a) => k(o, n, r, c, u, a, s)
		};
	}
	/**
	 * @param { HTMLElement } element
	 * @param { string } key
	 * @param { any } value
	 * @param { string } code
	 */
	apply(t, s, i, o) {
		const [n, r, ...c] = s.split(".");
		if (s !== "el") {
			if (Object.hasOwn(this.directives, n)) {
				this.directives[n](t, i, r, c, this.api.transform, n, o);
				return;
			}
			if (n in t) {
				st(t, i, r, c, this.api.transform, n);
				return;
			}
			V(t, i, r, c, this.api.transform, n);
		}
	}
}
const nt = {
	/**
	 * @param { any } value
	 * @param { number } [n=2]
	 * @returns { string }
	 */
	fixed: (e, t = 2) => Number(e).toFixed(t),
	/**
	 * @param { any } value
	 * @param { number } [n=10]
	 * @returns { number }
	 */
	int: (e, t = 10) => parseInt(e, t),
	/**
	 * @param { any } value
	 * @returns { number }
	 */
	abs: (e) => Math.abs(Number(e)),
	/**
	 * @param { any } value
	 * @returns { number }
	 */
	round: (e) => Math.round(Number(e)),
	/**
	 * @param { any } value
	 * @param { number } [min=0]
	 * @param { number } [max=1]
	 * @returns { number }
	 */
	clamp: (e, t = 0, s = 1) => Math.min(Math.max(Number(e), t), s),
	/**
	 * @param { any } value
	 * @param { string } [u='px']
	 * @returns { string }
	 */
	unit: (e, t = "px") => e + t,
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	trim: (e) => String(e).trim(),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	upper: (e) => String(e).toUpperCase(),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	lower: (e) => String(e).toLowerCase(),
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	capitalize: (e) => String(e).charAt(0).toUpperCase() + String(e).slice(1),
	/**
	 * @param { any } value
	 * @param { string } [def='-']
	 * @returns { any }
	 */
	default: (e, t = "-") => e || e === 0 ? e : t,
	/**
	 * @param { any } value
	 * @returns { string }
	 */
	json: (e) => JSON.stringify(e)
};
class rt {
	/**
	 * @param { object } clientModifiers
	 */
	constructor(t = {}) {
		/** @type { Record<string, Function> } */
		T(this, "modifiers");
		this.modifiers = { ...nt, ...t };
	}
	/**
	 * @param { any } value
	 * @param { string } name
	 * @param  { Array<string> } args
	 * @returns { any }
	 */
	transform(t, s, i) {
		return s ? Object.hasOwn(this.modifiers, s) ? this.modifiers[s](t, ...i) : (_.error(`Unknown modifier '${s}'`), t) : t;
	}
}
var x;
class ot {
	constructor() {
		T(this, "activeEffect", null);
		M(this, x, /* @__PURE__ */ new WeakMap());
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 * @param { Function } effect
	 */
	add(t, s, i) {
		E(this, x).has(t) || E(this, x).set(t, /* @__PURE__ */ new Map());
		const o = E(this, x).get(t);
		o.has(s) || o.set(s, /* @__PURE__ */ new Set()), o.get(s).add(i);
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 * @returns { Array<{el: HTMLElement, attr: string, update: Function}> }
	 */
	find(t, s) {
		const i = E(this, x).get(t), o = i == null ? void 0 : i.get(s);
		return o ? Array.from(o) : [];
	}
	/**
	 * @param {Function} effect
	 * @param {object} deps
	 */
	removeEffect(t, s) {
		if (s) {
			for (const i of s) {
				const { target: o, property: n } = i, r = E(this, x).get(o);
				if (r) {
					const c = r.get(n);
					c && (c.delete(t), c.size === 0 && r.delete(n)), r.size === 0 && E(this, x).delete(o);
				}
			}
			s.clear();
		}
	}
	/**
	 * @param {HTMLElement} element
	 */
	removeEffects(t) {
		if (t._effects) {
			for (const s of t._effects)
				this.removeEffect(s, s.deps);
			t._effects.clear();
		}
	}
}
x = new WeakMap();
var w;
class ct {
	/**
	 *
	 */
	constructor() {
		M(this, w);
		R(this, w, /* @__PURE__ */ new Map());
	}
	/**
	 * @param { HTMLElement } element
	 * @param { string } attr
	 * @param { Function } handle
	 */
	add(t, s, i) {
		E(this, w).has(t) || E(this, w).set(t, []);
		const [o, ...n] = s.split("."), r = {
			once: n.includes("once"),
			capture: n.includes("capture"),
			passive: n.includes("passive")
		};
		let c = (f) => {
			n.includes("stop") && f.stopPropagation(), n.includes("prevent") && f.preventDefault(), !(n.includes("self") && f.target !== t) && (n.includes("enter") && f.key !== "Enter" || i(f));
		};
		o === "create" ? (n.includes("async") && (t._async = !0), c = async (f) => {
			var g;
			const { detail: a, timestamp: d, done: p } = f, l = i({ name: a.name, target: t, timestamp: d, signal: a.signal });
			try {
				t._async && await l;
			} catch (b) {
				if ((g = a.signal) != null && g.aborted)
					return;
				throw _.error('Failed to execute "{0}" listener in component <{1}>.', ":oncreate", a.name), b;
			} finally {
				p();
			}
		}) : o === "destroy" && (c = (f) => {
			const { detail: a } = f;
			i({ name: a.name, target: t });
		});
		const u = { name: o, handler: c, options: r };
		E(this, w).get(t).push(u), t.addEventListener(o, c, r);
	}
	/**
	 * @param { HTMLElement } element
	 */
	remove(t) {
		const s = E(this, w).get(t);
		s && (s.forEach(({ name: i, handler: o, options: n }) => {
			t.removeEventListener(i, o, n);
		}), E(this, w).delete(t));
	}
}
w = new WeakMap();
function K(e) {
	return e.replace(/-([a-z])/g, (t, s) => s.toUpperCase());
}
const S = {
	props: 1,
	component: 2,
	"component.async": 3,
	each: 4,
	"each.once": 5
};
function A(e) {
	const t = e.startsWith(":") ? e.slice(1) : e;
	if (t === "el")
		return -1;
	if (S[t] !== void 0)
		return S[t];
	const s = t.split(".")[0];
	return S[s] !== void 0 ? S[s] : 100;
}
class ft {
	/**
	 * @param { object } options
	 * @param { Function } options.listeners
	 * @param { Function } options.destroy
	 */
	constructor({ listeners: t, destroy: s, attribute: i }) {
		this.listeners = t, this.destroy = s, this.attribute = i, this.nodes = /* @__PURE__ */ new WeakSet();
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } component
	 * @param { Function } handler
	 */
	// eslint-disable-next-line sonarjs/cognitive-complexity
	process(t, s, i) {
		const o = [t];
		for (; o.length; ) {
			const n = o.pop();
			if (n.nodeType === 1 || n.nodeType === 11) {
				let r = !1;
				if (n.nodeType === 1) {
					const u = Array.from(n.attributes);
					u.sort((a, d) => A(a.name) - A(d.name));
					const f = [];
					for (let a = 0; a < u.length; a++) {
						const d = u[a];
						this.attribute(n, d.name, d.value, s), d.name.charCodeAt(0) === 58 ? (r = !0, this.directive(d, n, i, f, s)) : d.name === "el" && (r = !0);
					}
					for (const a of f)
						n.removeAttribute(a);
					r && this.nodes.add(n);
				}
				let c = n.lastElementChild;
				for (; c; )
					o.push(c), c = c.previousElementSibling;
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
	directive(t, s, i, o, n) {
		const r = t.name.slice(1), c = K(r);
		c.charCodeAt(0) === 111 && c.charCodeAt(1) === 110 ? this.listeners(s, c.slice(2).toLowerCase(), t.value, n) : i(s, c, t.value), o.push(t.name);
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } els
	 */
	unprocess(t, s) {
		const i = [t];
		for (; i.length; ) {
			const o = i.pop();
			if (o._keep)
				continue;
			this.nodes.has(o) && (this.destroy(o, s), this.nodes.delete(o));
			let n = o.firstElementChild;
			for (; n; )
				i.push(n), n = n.nextElementSibling;
		}
	}
}
function I(e, t, s = {}) {
	if (t === "each" || t.startsWith("each.")) {
		(e.firstElementChild || e.textContent.trim() !== "") && (!e.hasAttribute(":component") && !e._component && !s.component ? (e._template = e.firstElementChild.cloneNode(!0), e.innerHTML = "") : _.error("Content (slots) is not allowed inside the :each directive.", e));
		return;
	}
	if (t === "component" || t.startsWith("component.")) {
		if (e._hasEach = e.hasAttribute(":each") || e.hasAttribute(":each.once") || e._hasEach || !!s.each || !!s["each.once"], e._slots)
			return;
		e._slots = {}, Array.from(e.childNodes).forEach((i) => {
			if (i.nodeType === 3 && !i.textContent.trim()) {
				i.remove();
				return;
			}
			const o = i.nodeType === 1 && i.getAttribute("slot") || "default";
			if (e._slots[o]) {
				_.error('Slot "{0}" is already occupied in component', o, e);
				return;
			}
			i._keep = !0, e._slots[o] = i, i.remove();
		});
	}
}
function at(e, t, s, i, o) {
	const [n, r, ...c] = t.split("."), u = c[0] || "input", f = "on" + u, a = c[1] || null, d = c.slice(2), p = s.get.call(i), l = o(p, a, d);
	if (e[r] !== l && l !== void 0 && (e[r] = l ?? ""), e._bound || (e._bound = {}), e._bound[f] && e._bound[f] !== r) {
		_.error('Conflict "{0}" already taken by "{1}".', f, e._bound[f], e);
		return;
	}
	if (!e._bound[f]) {
		const g = () => {
			s.set.call(i, o(e[r], a, d));
		};
		e.addEventListener(u, g), Object.defineProperty(e, f, {
			get: () => g,
			set: () => {
				_.error('Channel "{0}" is occupied by bind "{1}".', f, r, e);
			},
			configurable: !0,
			enumerable: !0
		}), e._bound[f] = r;
	}
}
const P = Symbol("is_proxy");
class dt {
	/**
	 * @param { PrototyOptions } options
	 */
	constructor({
		            state: t = {},
		            root: s = document.body,
		            params: i = {},
		            methods: o = {},
		            computed: n = {},
		            directives: r = {},
		            modifiers: c = {},
		            elements: u = {},
		            components: f = {},
		            setters: a = {},
		            created: d,
		            ready: p
	            }) {
		this.reactivity = new ot(), this.listeners = new ct(), this.contextStorage = /* @__PURE__ */ new WeakMap(), this.pendingTargets = /* @__PURE__ */ new Map(), this.initComputed(t, n), this.state = this.createProxy(t), this.methods = {}, this.setters = {}, this.activeSetters = /* @__PURE__ */ new Set(), this.bus = {
			root: s,
			state: this.state,
			methods: this.methods,
			params: i,
			components: B(f),
			els: {}
		}, O(this.methods, o, this.bus), O(this.setters, a, this.bus), this.nodes = new ft({
			listeners: (l, g, b, h) => {
				const v = $(b, h.bus, h.els, "event");
				this.listeners.add(l, g, (m) => {
					const y = this.getContext(l);
					return v(l, y, m);
				});
			},
			destroy: this.destroy.bind(this),
			attribute: (l, g, b, h) => {
				var v;
				if (g.startsWith(":")) {
					const m = g.slice(1);
					I(l, m);
				}
				if (g === "el") {
					const m = K(b);
					l._el = m, h.els[m] = l, this.functionality(l, (v = h.elements) == null ? void 0 : v[m], h);
				}
				g === "component" && (this.bus.components[b] = { name: b, template: l.tagName === "TEMPLATE" ? l.innerHTML.trim() : l.outerHTML, element: l });
			}
		}), this.modifiers = new rt(c), this.directive = new it(r, this.bus, {
			setup: this.setup.bind(this),
			unprocess: this.nodes.unprocess.bind(this.nodes),
			context: this.updateContext.bind(this),
			transform: this.modifiers.transform.bind(this.modifiers)
		}), d == null || d.call(this.bus), this.setup(s, { bus: this.bus, els: this.bus.els, elements: u }), p == null || p.call(this.bus);
	}
	/**
	 * @param { HTMLElement } element
	 * @param { object } directives
	 * @param { object } component
	 */
	functionality(t, s, i) {
		if (!s)
			return;
		const o = this.getContext(t, !0), n = Object.keys(s).sort((r, c) => A(r) - A(c));
		for (const r of n) {
			const c = s[r];
			if (typeof c != "function")
				continue;
			I(t, r, s);
			const u = {
				el: t,
				els: i.els,
				props: o
			};
			if (r === "props") {
				const a = () => {
					this.reactivity.removeEffect(a, a.deps), this.reactivity.activeEffect = a;
					try {
						const d = this.getContext(t, !0), p = {
							el: t,
							els: i.els,
							props: d
						}, l = c.call(i.bus, p);
						this.updateContext(t, l);
					} catch {
						_.error("Error applying props in elements", r, t);
					} finally {
						this.reactivity.activeEffect = null;
					}
				};
				a.deps = /* @__PURE__ */ new Set(), a(), t._effects || (t._effects = /* @__PURE__ */ new Set()), t._effects.add(a);
				continue;
			}
			if (r.startsWith("on")) {
				const a = r.slice(2);
				this.listeners.add(t, a, (d) => {
					try {
						c.call(i.bus, { ...u, event: d });
					} catch {
						_.error("Error in event handler", r, t);
					}
				});
				continue;
			}
			const f = () => {
				this.reactivity.removeEffect(f, f.deps), this.reactivity.activeEffect = f;
				try {
					const a = this.getContext(t, !0), d = {
						el: t,
						els: i.els,
						props: a
					}, p = c.call(i.bus, d);
					p && typeof p == "object" && "get" in p && "set" in p ? at(t, r, p, d, this.directive.api.transform) : this.directive.apply(t, r, p, p);
				} finally {
					this.reactivity.activeEffect = null;
				}
			};
			f.deps = /* @__PURE__ */ new Set(), f(), t._effects || (t._effects = /* @__PURE__ */ new Set()), t._effects.add(f), t._applied || (t._applied = /* @__PURE__ */ new Set()), t._applied.add(r.split(".")[0]);
		}
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } component
	 */
	setup(t, s) {
		this.nodes.process(t, s, (i, o, n) => {
			if (i._applied && i._applied.has(o.split(".")[0])) {
				_.warn('Directive "{0}" on element "{1}" is already defined in elements. HTML directive will be ignored.', o, i._el);
				return;
			}
			const r = $(n, s.bus, s.els), c = () => {
				this.reactivity.removeEffect(c, c.deps), this.reactivity.activeEffect = c;
				try {
					const u = this.getContext(i), f = r(i, u);
					o === "props" ? this.updateContext(i, f) : this.directive.apply(i, o, f, n);
				} finally {
					this.reactivity.activeEffect = null;
				}
			};
			i._effects || (i._effects = /* @__PURE__ */ new Set()), i._effects.add(c), c.deps = /* @__PURE__ */ new Set(), c();
		});
	}
	/**
	 * @param { object } rawState
	 * @param { Record<string, Function> } computed
	 */
	initComputed(t, s) {
		!s || Object.keys(s).length === 0 || Object.keys(s).forEach((i) => {
			i in t && _.warn('Computed property "{0}" overrides existing property', i);
			const o = s[i];
			let n, r = !0;
			const c = () => {
				r || (r = !0, this.schedule(t, i));
			};
			c.deps = /* @__PURE__ */ new Set(), Object.defineProperty(t, i, {
				get: () => {
					if (this.reactivity.activeEffect === c)
						return _.error('Circular dependency detected in computed property "{0}"', i), n;
					const u = this.reactivity.activeEffect;
					if (u && u !== c && (this.reactivity.add(t, i, u), u.deps.add({ target: t, property: i })), r) {
						const f = this.reactivity.activeEffect;
						c.deps.size > 0 && (this.reactivity.removeEffect(c, c.deps), c.deps.clear()), this.reactivity.activeEffect = c;
						try {
							n = o.bind(this.bus)();
						} catch (a) {
							_.error('Error in computed property "{0}": {1}', i, a.message), n = void 0;
						} finally {
							this.reactivity.activeEffect = f;
						}
						r = !1;
					}
					return n;
				},
				enumerable: !0,
				configurable: !0
			});
		});
	}
	/**
	 * @param { any } state
	 * @param { string } path
	 * @param { string } parent
	 * @returns { object }
	 */
	createProxy(t, s = "", i = null) {
		const o = this;
		return C(t) && Object.keys(t).forEach((n) => {
			const r = Object.getOwnPropertyDescriptor(t, n);
			r && typeof r.get == "function" || C(t[n]) && (t[n] = this.createProxy(
				t[n],
				s ? `${s}.${n}` : n,
				t
			));
		}), s && (Object.defineProperty(t, "_path", {
			value: s,
			enumerable: !1,
			writable: !0,
			configurable: !0
		}), Object.defineProperty(t, "_parent", {
			value: i,
			enumerable: !1,
			writable: !0,
			configurable: !0
		})), Object.defineProperty(t, P, {
			value: !0,
			enumerable: !1,
			writable: !1,
			configurable: !1
		}), Object.defineProperty(t, "_lastSegment", {
			value: s ? s.split(".").pop() : null,
			enumerable: !1,
			writable: !1,
			configurable: !1
		}), new Proxy(t, {
			get(n, r, c) {
				if (r === P)
					return !0;
				const u = Reflect.get(n, r, c), f = typeof r != "symbol" && r in n && typeof u != "function", a = o.reactivity.activeEffect;
				return f && a && (o.reactivity.add(n, r, a), a.deps.add({ target: n, property: r })), u;
			},
			// eslint-disable-next-line sonarjs/cognitive-complexity
			set(n, r, c, u) {
				var h;
				if (typeof r == "symbol")
					return Reflect.set(n, r, c, u);
				const f = Object.getOwnPropertyDescriptor(n, r);
				if (f && typeof f.get == "function" && typeof f.set != "function")
					return _.error('Computed property "{0}" is readonly.', r.toString()), !1;
				const a = Array.isArray(n), d = Reflect.get(n, r), p = a && r === "length";
				if (!p && Object.is(d, c))
					return !0;
				const l = s ? `${s}.${r.toString()}` : r.toString();
				let g = c;
				if (C(c) && !(c instanceof Date) && !c[P] && (g = o.createProxy(c, l)), typeof ((h = o.setters) == null ? void 0 : h[l]) == "function" && !o.activeSetters.has(l)) {
					o.activeSetters.add(l);
					try {
						if (g = o.setters[l](g, d), Object.is(d, g))
							return !0;
					} catch (v) {
						_.error('Error in setter for "{0}": {1}', l, v.message), g = d;
					} finally {
						o.activeSetters.delete(l);
					}
				}
				const b = Reflect.set(n, r, g, u);
				return b && (o.schedule(n, r), a && !p && o.schedule(n, "length")), b;
			}
		});
	}
	/**
	 * @param { object } target
	 * @param { string } property
	 */
	schedule(t, s) {
		const i = (n, r) => {
			this.pendingTargets.has(n) || (this.pendingTargets.set(n, /* @__PURE__ */ new Set()), queueMicrotask(() => {
				const c = this.pendingTargets.get(n);
				this.pendingTargets.delete(n);
				const u = /* @__PURE__ */ new Set();
				c.forEach((f) => {
					this.reactivity.find(n, f).forEach((p) => u.add(p));
					const d = n[f];
					d && d._path && this.reactivity.find(n, d._path).forEach((l) => u.add(l));
				}), u.forEach((f) => {
					f !== this.reactivity.activeEffect && f();
				});
			})), this.pendingTargets.get(n).add(r);
		};
		i(t, s);
		let o = t;
		for (; o && o._parent; ) {
			const n = o._lastSegment;
			n && i(o._parent, n), o = o._parent;
		}
	}
	/**
	 * @param { HTMLElement } element
	 * @param { boolean } reactive
	 * @returns { any }
	 */
	getContext(t, s = !0) {
		const i = this, o = s ? this.reactivity.activeEffect : null;
		return new Proxy({}, {
			get(n, r) {
				let c = t;
				for (; c; ) {
					const u = i.contextStorage.get(c);
					if (u != null && u.data && r in u.data) {
						if (o) {
							const f = `ctx:${String(r)}`;
							i.reactivity.add(c, f, o), o.deps.add({ target: c, property: f });
						}
						return u.data[r];
					}
					c = c.parentElement;
				}
			},
			has: () => !0
		});
	}
	/**
	 * @param { HTMLElement } element
	 * @param { any } newValue
	 */
	updateContext(t, s) {
		let i = this.contextStorage.get(t);
		i || (i = { data: {}, isScope: !1 }, this.contextStorage.set(t, i));
		for (const o in s) {
			const n = s[o];
			if (i.data[o] !== n) {
				i.data[o] = n;
				const c = `ctx:${o}`;
				this.reactivity.find(t, c).forEach((f) => {
					f !== this.reactivity.activeEffect && f();
				});
			}
		}
	}
	/**
	 * @param { HTMLElement } element
	 * @param { object } els
	 */
	destroy(t, s = null) {
		t._el && s && delete s[t._el];
		for (const i of Array.from(t.children))
			this.destroy(i, t.els || null);
		this.listeners.remove(t), this.reactivity.removeEffects(t), z(t), t.els && (t.els = {});
	}
}
function ht(e) {
	const t = () => new Promise((s) => {
		queueMicrotask(() => {
			requestAnimationFrame(() => {
				s();
			});
		});
	});
	return e ? t().then(e) : t();
}
function lt(e, t) {
	return JSON.stringify(e) === JSON.stringify(t);
}
function pt(e) {
	const t = new dt(e);
	let s = !1;
	return {
		...t.bus,
		destroy: () => {
			var i, o;
			s || (t.destroy(t.bus.root), (i = t.pendingTargets) == null || i.clear(), (o = t.activeSetters) == null || o.clear(), t.bus = null, s = !0);
		}
	};
}
export {
	lt as isEqual,
	C as isObject,
	K as kebabToCamel,
	ht as nextTick,
	pt as prototy
};
