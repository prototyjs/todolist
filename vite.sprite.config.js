import { defineConfig } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const __dirname = dirname(fileURLToPath(import.meta.url))

const includeIcons = []

const PATHS = {
	svgSource: resolve(__dirname, 'public/icons'),
	outputDir: resolve(__dirname, 'public/icons'),
	outputFile: resolve(__dirname, 'public/icons/sprites.svg'),
}

function toKebabCase(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, '\$1-\$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase()
}

if (!existsSync(PATHS.outputDir)) {
	mkdirSync(PATHS.outputDir, { recursive: true })
}

let iconsToProcess = []

if (includeIcons.length > 0) {
	iconsToProcess = includeIcons
} else if (existsSync(PATHS.svgSource)) {
	iconsToProcess = readdirSync(PATHS.svgSource)
		.filter(file => extname(file).toLowerCase() === '.svg' && file !== 'sprites.svg')
		.map(file => basename(file, '.svg'))
}

const symbols = []

iconsToProcess.forEach(name => {
	const svgPath = resolve(PATHS.svgSource, `${name}.svg`)

	if (!existsSync(svgPath)) {
		console.warn(`⚠️ Warning: Icon "${name}.svg" not found at ${PATHS.svgSource}. Skipping...`)
		return
	}

	try {
		const svgRaw = readFileSync(svgPath, 'utf-8')
		const optimizationResult = optimize(svgRaw, {
			path: svgPath,
			multipass: true,
			plugins: [
				'preset-default',
				{ name: 'removeAttrs', params: { attrs: ['data-name', 'style'] } }
			]
		})

		const cleanSvg = optimizationResult.data
		const viewBoxMatch = cleanSvg.match(/viewBox=["']([^"']+)["']/i)
		const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

		const svgContent = cleanSvg
			.replace(/<svg[^>]*>/i, '')
			.replace(/<\/svg>/i, '')
			.trim()

		// ПРИМЕНЯЕМ КЕБАБ-КЕЙС ДЛЯ ID
		const symbolId = `icon-${toKebabCase(name)}`
		symbols.push(`  <symbol id="${symbolId}" viewBox="${viewBox}">\n    ${svgContent}\n  </symbol>`)
	} catch (error) {
		console.error(`❌ Error processing icon "${name}":`, error.message)
	}
})

if (symbols.length > 0) {
	const spriteContent = [
		'<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">',
		symbols.join('\n'),
		'</svg>'
	].join('\n')

	try {
		writeFileSync(PATHS.outputFile, spriteContent, 'utf-8')
		console.log(`✅ Sprite successfully generated with ${symbols.length} icons at: ${PATHS.outputFile}`)
	} catch (error) {
		console.error('❌ Failed to write sprite file:', error.message)
	}
}

export default defineConfig({})
