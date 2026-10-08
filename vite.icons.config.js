import { defineConfig } from 'vite'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PATHS = {
	svgSource: resolve(__dirname, 'public/icons'),
	virtualDir: resolve(__dirname, 'node_modules/.vite-icon'),
}

if (!existsSync(PATHS.virtualDir)) {
	mkdirSync(PATHS.virtualDir, { recursive: true })
}

const toPascalCase = (str) =>
	str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')

const singleIconArg = process.argv[2] ? basename(process.argv[2], '.svg') : null

let iconNames = []
try {
	if (singleIconArg) {
		const targetPath = resolve(PATHS.svgSource, singleIconArg + '.svg')
		if (!existsSync(targetPath)) {
			console.error(`❌ Error: Icon file not found at ${targetPath}`)
			process.exit(1)
		}
		iconNames = [singleIconArg]
	} else {
		iconNames = readdirSync(PATHS.svgSource)
			.filter(file => file.endsWith('.svg'))
			.map(file => basename(file, '.svg'))
	}

	if (iconNames.length === 0) {
		console.warn('⚠️ No SVG files found to process')
	}
} catch (error) {
	console.error(`❌ Error scanning directory: ${error.message}`)
	process.exit(1)
}

const commonStyles = ':host { display: inline-flex; width: var(--icon-size, 1em); height: var(--icon-size, 1em); vertical-align: middle; color: inherit; } svg { width: 100%; height: 100%; fill: currentColor; display: block; }';
const stylesContent = [
	`const styles = ${JSON.stringify(commonStyles)};`,
	`export const sheet = new CSSStyleSheet();`,
	`sheet.replaceSync(styles);`
].join('\n')

if (!existsSync(resolve(PATHS.virtualDir, 'styles.js')) || !singleIconArg) {
	writeFileSync(resolve(PATHS.virtualDir, 'styles.js'), stylesContent)
}

iconNames.forEach(name => {
	try {
		const svgPath = resolve(PATHS.svgSource, name + '.svg')
		const svgRaw = readFileSync(svgPath, 'utf-8')

		const optimizationResult = optimize(svgRaw, {
			path: svgPath,
			multipass: true,
			plugins: [
				'preset-default',
				{
					name: 'removeAttrs',
					params: {
						attrs: ['data-name', 'style']
					}
				}
			]
		})

		const cleanSvg = optimizationResult.data
		const tagName = 'icon-' + name.toLowerCase()
		const className = 'Icon' + toPascalCase(name)
		const jsonSvg = JSON.stringify(cleanSvg)

		const content = [
			'import { sheet } from "./styles.js";',
			'',
			'const svg = ' + jsonSvg + ';',
			'',
			'export class ' + className + ' extends HTMLElement {',
			'  connectedCallback() {',
			'    if (!this.shadowRoot) {',
			'      const shadow = this.attachShadow({ mode: "open" });',
			'      shadow.adoptedStyleSheets = [sheet];',
			'      shadow.innerHTML = svg;',
			'    }',
			'  }',
			'}',
			'',
			'if (typeof window !== "undefined" && !customElements.get("' + tagName + '")) {',
			'  customElements.define("' + tagName + '", ' + className + ');',
			'}',
		].join('\n')

		writeFileSync(resolve(PATHS.virtualDir, name + '.js'), content)
	} catch (error) {
		console.error('❌ Error processing icon ' + name + ':', error.message)
	}
})

let finalExportNames = iconNames

if (singleIconArg) {
	const indexPath = resolve(PATHS.virtualDir, 'index.js')
	let currentExports = new Set()

	if (existsSync(indexPath)) {
		const fileContent = readFileSync(indexPath, 'utf-8')
		const matches = fileContent.matchAll(/export \* from '\.\/(.+?)\.js';/g)
		for (const match of matches) {
			currentExports.add(match[1])
		}
	}

	currentExports.add(singleIconArg)
	finalExportNames = Array.from(currentExports)
}

const indexContent = finalExportNames.map(name => `export * from './${name}.js';`).join('\n')
writeFileSync(resolve(PATHS.virtualDir, 'index.js'), indexContent)

if (singleIconArg) {
	console.log(`✅ Successfully updated single icon [${singleIconArg}] inside node_modules/.vite-icon`)
} else {
	console.log(`✅ Successfully generated all ${iconNames.length} optimized icons inside node_modules/.vite-icon`)
}

export default defineConfig({})
