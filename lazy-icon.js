const svgCache = new Map()
const ICONS_BASE_URL = '/icons/'

const lazyIconStyles = new CSSStyleSheet()
lazyIconStyles.replaceSync(`
  :host {
    display: inline-flex;
    width: var(--icon-size, 1em);
    height: var(--icon-size, 1em);
    vertical-align: middle;
    color: inherit;
  }
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    display: block;
  }
`);

export class LazyIcon extends HTMLElement {
	static get observedAttributes() {
		return ['name']
	}

	constructor() {
		super()
		this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [lazyIconStyles]
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'name' && newVal && newVal !== oldVal) {
			this._loadIcon(newVal)
		}
	}

	async _loadIcon(iconName) {
		const url = `${ICONS_BASE_URL}${iconName}.svg`

		if (svgCache.has(url)) {
			this.shadowRoot.innerHTML = svgCache.get(url)
			return
		}

		try {
			const response = await fetch(url)

			if (!response.ok) {
				throw new Error(`HTTP status ${response.status}`)
			}

			const contentType = response.headers.get('content-type')
			if (!contentType || !contentType.includes('image/svg+xml')) {
				throw new Error(`Invalid content type received: "${contentType}". Expected "image/svg+xml"`)
			}

			const svgText = await response.text()

			svgCache.set(url, svgText)
			this.shadowRoot.innerHTML = svgText
		} catch (error) {
			console.error(`❌ [lazy-icon] Failed to load icon "${iconName}":`, error.message)

			this.shadowRoot.innerHTML = `<svg viewBox="0 0 24 24"></svg>`
		}
	}
}

if (typeof window !== 'undefined' && !customElements.get('lazy-icon')) {
	customElements.define('lazy-icon', LazyIcon)
}
