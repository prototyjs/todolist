const SPRITE_URL = './icons/sprites.svg'

const spriteIconStyles = new CSSStyleSheet()
spriteIconStyles.replaceSync(`
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
`) // filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));

function toKebabCase(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, '\$1-\$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase()
}

export class SpriteIcon extends HTMLElement {
	static get observedAttributes() {
		return ['name']
	}

	constructor() {
		super()

		const shadow = this.attachShadow({ mode: 'open' })
		shadow.adoptedStyleSheets = [spriteIconStyles]

		shadow.innerHTML = `
			<svg>
				<use></use>
			</svg>
		`
		this._useElement = shadow.querySelector('use')
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'name') {
			if (newVal) {
				const formattedName = toKebabCase(newVal)
				this._useElement.setAttribute('href', `${SPRITE_URL}#icon-${formattedName}`)
			} else {
				this._useElement.removeAttribute('href')
			}
		}
	}
}

if (typeof window !== 'undefined' && !customElements.get('sprite-icon')) {
	customElements.define('sprite-icon', SpriteIcon)
}