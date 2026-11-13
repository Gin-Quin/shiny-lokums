/**
 * The behaviour of the landing page: language and theme switches, scroll reveals, pointer effects,
 * the thread of the timeline, and the loukoum mode.
 */

import frenchResume from "./assets/cv/Matthieu-Gindre-CV-FR.pdf" with { type: "file" }
import englishResume from "./assets/cv/Matthieu-Gindre-CV-EN.pdf" with { type: "file" }

const root = document.documentElement
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches

const one = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T =>
	parent.querySelector<T>(selector)!

const all = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T[] => [
	...parent.querySelectorAll<T>(selector),
]

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/** Storage throws in some private modes: a preference that cannot be saved is not worth a crash. */
function remember(storage: Storage, key: string, value: string | null) {
	try {
		if (value === null) storage.removeItem(key)
		else storage.setItem(key, value)
	} catch {}
}

/** Run `update`, and reveal the updated page through a circle growing from `origin`. */
async function sweep(origin: Element, update: () => void, duration = 650) {
	if (reducedMotion || !document.startViewTransition) return update()

	const box = origin.getBoundingClientRect()
	const x = box.left + box.width / 2
	const y = box.top + box.height / 2
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

	const transition = document.startViewTransition(update)
	await transition.ready.then(
		() => {
			root.animate(
				{ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{ duration, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
			)
		},
		() => {}, // A skipped transition still applies the update and resolves `finished`.
	)
	await transition.finished
}

// ─── Language ───────────────────────────────────────────

type Language = "fr" | "en"

/** Picked before the first paint by the script in `index.html`. */
let lang: Language = root.lang == "en" ? "en" : "fr"
let loukoum = false

const texts = {
	fr: {
		title: document.title,
		loukoumTitle: "Le Royaume du Loukoum · Matthieu Gindre",
		quotes: [
			"Un loukoum par commit, et tout ira bien.",
			"Mon code est garanti sans sucre ajouté. Enfin… presque.",
			"Chez moi, même les bugs sont fondants.",
			"On ne dit pas « legacy », on dit « confit ».",
			"Je scale horizontalement. Verticalement aussi, depuis les loukoums.",
			"Rahat lokum : « le repos de la gorge ». Et du backlog.",
		],
		peeks: ["Coucou !", "Psst… un loukoum ?", "Je surveille votre glycémie.", "Rahat !", "Vous reprendrez bien un SaaS ?"],
		bites: ["Miam !", "Crounch", "Mmmh…", "Slurp", "Encore !", "Délicieux"],
		milestones: {
			1: "Premier loukoum. C'est le début de la fin.",
			5: "Je vois qu'on est gourmand par ici 😏",
			10: "10 ! Votre dentiste vient de frissonner.",
			20: "20 loukoums. Pensez à vous hydrater.",
			35: "35… Vous savez qu'il y a un vrai site derrière ?",
			50: "50 loukoums : vous voilà Grand Vizir du Sucre.",
			100: "100. Je n'ai plus de blague. Engagez-moi.",
		} as Record<number, string>,
		activated: "Mode loukoum activé. Attrapez les loukoums pour les dévorer !",
		dodges: ["Non non non, on reste encore un peu !", "Bon… d'accord. C'est bien parce que c'est vous."],
		round: "Matthieu offre sa tournée !",
	},
	en: {
		title: "Digital Loukoum · Matthieu Gindre, custom software development",
		loukoumTitle: "The Loukoum Kingdom · Matthieu Gindre",
		quotes: [
			"One loukoum per commit, and all will be well.",
			"My code is guaranteed sugar-free. Well… almost.",
			"Around here, even the bugs melt in your mouth.",
			"We don't say “legacy”, we say “candied”.",
			"I scale horizontally. Vertically too, since the loukoums.",
			"Rahat lokum: “the throat's rest”. And the backlog's.",
		],
		peeks: ["Hello there!", "Psst… a loukoum?", "I'm watching your blood sugar.", "Rahat!", "Another SaaS, perhaps?"],
		bites: ["Yum!", "Crunch", "Mmmh…", "Slurp", "More!", "Delicious"],
		milestones: {
			1: "First loukoum. This is the beginning of the end.",
			5: "Someone has a sweet tooth around here 😏",
			10: "10! Your dentist just shivered.",
			20: "20 loukoums. Remember to stay hydrated.",
			35: "35… You know there's a real website behind this?",
			50: "50 loukoums: you are now Grand Vizier of Sugar.",
			100: "100. I'm out of jokes. Hire me.",
		} as Record<number, string>,
		activated: "Loukoum mode on. Catch the loukoums to devour them!",
		dodges: ["No no no, stay a little longer!", "Fine… alright. Only because it's you."],
		round: "This round's on Matthieu!",
	},
}

const text = () => texts[lang]

/**
 * Every element with a `data-en` or `data-lk` attribute has up to four versions of its content: French in the HTML,
 * English in `data-en`, and their loukoum versions in `data-lk` and `data-lk-en`.
 */
function translate() {
	for (const element of all("[data-en], [data-lk]")) {
		const versions = element.dataset
		versions.fr ??= element.innerHTML
		const english = versions.en ?? versions.fr
		element.innerHTML =
			lang == "en" ? (loukoum ? (versions.lkEn ?? english) : english) : loukoum ? (versions.lk ?? versions.fr) : versions.fr
	}

	// attributes: `data-en-alt` is the English `alt`, and so on
	for (const attribute of ["alt", "aria-label", "href"]) {
		for (const element of all(`[data-en-${attribute}]`)) {
			if (!element.hasAttribute(`data-fr-${attribute}`)) {
				element.setAttribute(`data-fr-${attribute}`, element.getAttribute(attribute)!)
			}
			element.setAttribute(attribute, element.getAttribute(`data-${lang}-${attribute}`)!)
		}
	}

	document.title = loukoum ? text().loukoumTitle : text().title

	// the bundler only ships the files this script imports: the download links get their address here,
	// `same` being the resume in the language of the page and `other` the one in the other language
	for (const link of all<HTMLAnchorElement>("[data-cv]")) {
		const { cv } = link.dataset
		const french = cv == "fr" || (cv == "same" && lang == "fr") || (cv == "other" && lang == "en")
		link.href = french ? frenchResume : englishResume
		link.download = french ? "Matthieu-Gindre-CV-FR.pdf" : "Matthieu-Gindre-CV-EN.pdf"
	}
}

one("#lang-toggle").addEventListener("click", event => {
	lang = lang == "fr" ? "en" : "fr"
	sweep(event.currentTarget as Element, () => {
		root.lang = lang
		translate()
		layoutThread()
	})
	remember(localStorage, "lang", lang)
})

// ─── Theme ──────────────────────────────────────────────

one("#theme-toggle").addEventListener("click", event => {
	const isDark = root.dataset.theme
		? root.dataset.theme == "dark"
		: matchMedia("(prefers-color-scheme: dark)").matches
	const theme = isDark ? "light" : "dark"

	sweep(event.currentTarget as Element, () => {
		root.dataset.theme = theme
	})
	remember(localStorage, "theme", theme)
})

// ─── Scroll reveals and counters ────────────────────────

function countUp(element: HTMLElement) {
	const target = Number(element.dataset.count)
	const start = performance.now()

	const frame = (now: number) => {
		const progress = Math.min(1, (now - start) / 1400)
		element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)))
		if (progress < 1) requestAnimationFrame(frame)
	}

	requestAnimationFrame(frame)
}

const revealer = new IntersectionObserver(
	entries => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue
			entry.target.classList.add("in")
			revealer.unobserve(entry.target)
			if (!reducedMotion) all("[data-count]", entry.target).forEach(countUp)
		}
	},
	{ threshold: 0.12 },
)

all("[data-reveal]").forEach(element => revealer.observe(element))

// ─── Pointer effects ────────────────────────────────────

const heroArt = one(".hero-art")

addEventListener(
	"pointermove",
	event => {
		if (reducedMotion || event.pointerType != "mouse") return

		// the cubes around the portrait drift with the pointer, each at its own depth
		heroArt.style.setProperty("--px", (event.clientX / innerWidth - 0.5).toFixed(3))
		heroArt.style.setProperty("--py", (event.clientY / innerHeight - 0.5).toFixed(3))

		// cards are lit from where the pointer is, and projects lean towards it
		const card = (event.target as Element).closest<HTMLElement>(".glow")
		if (!card) return
		const box = card.getBoundingClientRect()
		const x = event.clientX - box.left
		const y = event.clientY - box.top
		card.style.setProperty("--mx", `${x}px`)
		card.style.setProperty("--my", `${y}px`)
		card.style.setProperty("--ry", `${((x / box.width - 0.5) * 5).toFixed(2)}deg`)
		card.style.setProperty("--rx", `${((0.5 - y / box.height) * 5).toFixed(2)}deg`)
	},
	{ passive: true },
)

// ─── Timeline: the thread ───────────────────────────────

const timeline = one(".timeline")
const thread = one<SVGSVGElement>(".thread", timeline)
const threadTrack = one<SVGPathElement>(".thread-track", thread)
const threadLine = one<SVGPathElement>(".thread-line", thread)
const traveler = one(".traveler", timeline)
const stops = all(".stop", timeline)
const dots = all(".stop-dot", timeline)

type Point = { x: number; y: number }

/** The distance, along the thread, between two entries of `reach`, at most. */
const sampling = 6

let threadLength = 0
let threadTarget = 0
let threadDrawn = 0
let gliding = false
let dotHeights: number[] = []

/**
 * In a loop the thread goes back up. Every few pixels of thread, `reach` records the length of the thread so far
 * and the lowest height it has reached, which only ever grows.
 */
let reach: { length: number; lowest: number }[] = []

/** Draw the thread through every dot of the timeline. Runs again whenever the timeline is resized. */
function layoutThread() {
	const width = timeline.offsetWidth
	const height = timeline.offsetHeight
	const radius = innerWidth > 760 ? 26 : 11
	const points = dots.map(dot => ({
		x: dot.offsetLeft + dot.offsetWidth / 2,
		y: dot.offsetTop + dot.offsetHeight / 2,
	}))

	// the browser is far too slow at measuring a path (`getPointAtLength` walks the whole path on every call)
	// to sample it hundreds of times: each piece of the path is flattened into `flat` as it is drawn
	const flat: Point[] = [{ x: points[0]!.x, y: 0 }]
	let path = `M${points[0]!.x},0`

	/** A curve that leaves `from` and arrives at `to` vertically: the thread waves from side to side. */
	const wave = (from: Point, to: Point) => {
		const middle = (from.y + to.y) / 2
		const steps = Math.ceil((Math.abs(to.x - from.x) + Math.abs(to.y - from.y)) / sampling)
		path += ` C${from.x},${middle} ${to.x},${middle} ${to.x},${to.y}`

		for (let step = 1; step <= steps; step++) {
			const t = step / steps
			const u = 1 - t
			flat.push({
				x: from.x * (u ** 3 + 3 * u * u * t) + to.x * (3 * u * t * t + t ** 3),
				y: from.y * u ** 3 + middle * 3 * u * t + to.y * t ** 3,
			})
		}
	}

	wave(flat[0]!, points[0]!)

	for (let index = 1; index < points.length; index++) {
		const from = points[index - 1]!
		const to = points[index]!

		if (!stops[index]!.classList.contains("detour")) {
			wave(from, to)
			continue
		}

		// nobody goes straight to a detour: halfway there, the thread wanders into a loop, downwards first
		const halfway = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
		const across = to.x > from.x ? 2 * radius : -2 * radius
		const turn = `${radius},${radius} 0 1,${across > 0 ? 0 : 1}`
		const steps = Math.ceil((2 * Math.PI * radius) / sampling)
		wave(from, halfway)
		path += ` a${turn} ${across},0 a${turn} ${-across},0`

		for (let step = 1; step <= steps; step++) {
			const angle = (step / steps) * 2 * Math.PI
			flat.push({
				x: halfway.x + (across / 2) * (1 - Math.cos(angle)),
				y: halfway.y + radius * Math.sin(angle),
			})
		}

		wave(halfway, to)
	}

	thread.setAttribute("viewBox", `0 0 ${width} ${height}`)
	one("linearGradient", thread).setAttribute("y2", String(height))
	threadTrack.setAttribute("d", path)
	threadLine.setAttribute("d", path)

	threadLength = threadLine.getTotalLength()
	threadLine.style.strokeDasharray = String(threadLength)
	dotHeights = points.map(point => point.y)

	let length = 0
	let lowest = 0
	reach = flat.map((point, index) => {
		const previous = flat[index - 1] ?? point
		length += Math.hypot(point.x - previous.x, point.y - previous.y)
		lowest = Math.max(lowest, point.y)
		return { length, lowest }
	})

	// a flattened curve is a hair shorter than the real one: stretched, both end exactly at the last dot
	for (const entry of reach) entry.length *= threadLength / length

	threadDrawn = Math.min(threadDrawn, threadLength)
	followThread()
}

/** Aim the thread at the reading line of the viewport. */
function followThread() {
	const readingLine = innerHeight * 0.62 - timeline.getBoundingClientRect().top

	// `reach` is sorted: the longest thread that stays above the reading line is found by bisection
	let low = 0
	let high = reach.length - 1
	while (low < high) {
		const middle = Math.ceil((low + high) / 2)
		if (reach[middle]!.lowest <= readingLine) low = middle
		else high = middle - 1
	}

	threadTarget = reach[low]!.length
	if (gliding) return
	gliding = true
	requestAnimationFrame(glide)
}

/** Unroll the thread a bit more towards its target, and bring the traveler along. */
function glide() {
	// the thread catches up smoothly, so the traveler rides through the loops instead of jumping over them
	const gap = threadTarget - threadDrawn
	threadDrawn = reducedMotion || Math.abs(gap) < 0.5 ? threadTarget : threadDrawn + gap * 0.2

	const point = threadLine.getPointAtLength(threadDrawn)
	threadLine.style.strokeDashoffset = String(threadLength - threadDrawn)
	traveler.style.transform = `translate(${point.x}px, ${point.y}px)`
	traveler.style.setProperty("--roll", `${Math.round(threadDrawn * 0.9)}deg`)

	// a stop that has been reached stays visible, even when scrolling back up
	stops.forEach((stop, index) => {
		if (dotHeights[index]! <= point.y + 2) stop.classList.add("reached")
	})

	gliding = threadDrawn != threadTarget
	if (gliding) requestAnimationFrame(glide)
}

new ResizeObserver(layoutThread).observe(timeline)
addEventListener("scroll", followThread, { passive: true })

// ─── Loukoum mode ───────────────────────────────────────

const toggle = one<HTMLButtonElement>("#loukoum-toggle")
const sweetsLayer = one("#sweets")
const eatenCounter = one("#eaten")
const toastElement = one("#toast")
const portrait = one("#portrait")
const bubble = one("#bubble")
const peeker = one("#peeker")
const main = one("main")
const favicon = one<HTMLLinkElement>("#favicon")

const sprites = all<HTMLImageElement>("#sprites img:not([id])")
const loukoumSprites = sprites.filter(sprite => !("bit" in sprite.dataset))
const bitSprites = sprites.filter(sprite => "bit" in sprite.dataset)

const proFavicon = favicon.href
const loukoumFavicon = one<HTMLImageElement>("#favicon-loukoum").src
const loukoumCursor = one<HTMLImageElement>("#cursor-loukoum").src
const loukoumHoverCursor = one<HTMLImageElement>("#cursor-loukoum-hover").src

type Sweet = {
	element: HTMLElement
	x: number
	y: number
	speedX: number
	speedY: number
	angle: number
	spin: number
	size: number
}

let sweets: Sweet[] = []
let floorUntil = 0
let eaten = 0
let dodges = 0
let activatedAt = 0
let quoteIndex = 0
let looping = false
let previousFrame = 0
let previousScroll = 0
let jelly = 0
let toastTimer = 0
let peekTimer = 0
let audio: AudioContext | undefined

function setLoukoum(on: boolean) {
	loukoum = on
	root.toggleAttribute("data-loukoum", on)
	toggle.setAttribute("aria-pressed", String(on))

	translate()
	favicon.href = on ? loukoumFavicon : proFavicon
	root.style.cursor = on ? `url("${loukoumCursor}") 6 6, auto` : ""
	// read by `loukoum.css` for links and buttons
	root.style.setProperty("--hover-cursor", `url("${loukoumHoverCursor}") 6 6, pointer`)
	dodges = 0
	activatedAt = performance.now()
	toggle.style.translate = ""

	if (on) {
		startLoop()
		schedulePeek()
	} else {
		clearTimeout(peekTimer)
		peeker.classList.remove("out")
		toastElement.classList.remove("show")
	}

	layoutThread()
}

function toast(message: string) {
	toastElement.textContent = message
	toastElement.classList.add("show")
	clearTimeout(toastTimer)
	toastTimer = window.setTimeout(() => toastElement.classList.remove("show"), 3400)
}

/** A short "pop", synthesized: no sound file to download. */
function pop() {
	audio ??= new AudioContext()
	const now = audio.currentTime
	const oscillator = audio.createOscillator()
	const gain = audio.createGain()
	oscillator.frequency.setValueAtTime(480 + Math.random() * 320, now)
	oscillator.frequency.exponentialRampToValueAtTime(130, now + 0.13)
	gain.gain.setValueAtTime(0.07, now)
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
	oscillator.connect(gain).connect(audio.destination)
	oscillator.start(now)
	oscillator.stop(now + 0.16)
}

/** Add an element to the sweets layer, at a position of the viewport, until its animation ends. */
function flash(className: string, x: number, y: number, text = "") {
	const element = document.createElement("span")
	element.className = className
	element.textContent = text
	element.style.left = `${x}px`
	element.style.top = `${y}px`
	element.addEventListener("animationend", () => element.remove())
	sweetsLayer.append(element)
}

function spawn(x: number, y: number, speedX: number, speedY: number, bit = false) {
	const element = pick(bit ? bitSprites : loukoumSprites).cloneNode() as HTMLImageElement
	const size = bit ? 18 + Math.random() * 18 : 44 + Math.random() * 50
	element.loading = "eager"
	element.className = bit ? "sweet bit" : "sweet"
	element.style.width = `${size}px`
	sweetsLayer.append(element)
	sweets.push({
		element,
		x: x - size / 2,
		y: y - size / 2,
		speedX,
		speedY,
		angle: Math.random() * 360,
		spin: (Math.random() - 0.5) * 420,
		size,
	})
	startLoop()
}

/** Loukoums fall from the sky, bounce on the bottom of the window for a few seconds, then fall through. */
function rain(count: number) {
	floorUntil = performance.now() + 5500
	for (let index = 0; index < count; index++) {
		setTimeout(
			() => spawn(Math.random() * innerWidth, -80, (Math.random() - 0.5) * 220, Math.random() * 300, index % 4 == 3),
			index * 50,
		)
	}
}

/** Loukoums fly out of a point, like a cork popping. */
function burst(x: number, y: number, count: number) {
	for (let index = 0; index < count; index++) {
		spawn(x, y, (Math.random() - 0.5) * 900, -350 - Math.random() * 650, index % 3 == 2)
	}
	flash("puff", x, y)
}

function startLoop() {
	if (looping) return
	looping = true
	previousFrame = performance.now()
	previousScroll = scrollY
	requestAnimationFrame(loop)
}

function loop(now: number) {
	if (!loukoum && !sweets.length) {
		looping = false
		main.style.removeProperty("--jelly")
		return
	}

	const elapsed = Math.min(0.034, (now - previousFrame) / 1000)
	previousFrame = now
	const hasFloor = now < floorUntil

	sweets = sweets.filter(sweet => {
		sweet.speedY += 1900 * elapsed
		sweet.x += sweet.speedX * elapsed
		sweet.y += sweet.speedY * elapsed
		sweet.angle += sweet.spin * elapsed

		const ground = innerHeight - sweet.size
		if (hasFloor && sweet.y > ground) {
			sweet.y = ground
			sweet.speedY = Math.abs(sweet.speedY) < 90 ? 0 : sweet.speedY * -0.45
			sweet.speedX *= 0.75
			sweet.spin *= 0.6
		}

		if (sweet.x < 0 || sweet.x > innerWidth - sweet.size) {
			sweet.x = clamp(sweet.x, 0, innerWidth - sweet.size)
			sweet.speedX *= -0.6
		}

		if (sweet.y > innerHeight + 140 || !sweet.element.isConnected) {
			sweet.element.remove()
			return false
		}

		sweet.element.style.transform = `translate(${sweet.x}px, ${sweet.y}px) rotate(${sweet.angle}deg)`
		return true
	})

	// the page wobbles like jelly, in proportion to the speed of the scroll
	const scrollSpeed = scrollY - previousScroll
	previousScroll = scrollY
	const target = reducedMotion ? 0 : clamp(scrollSpeed / 70, -1, 1)
	if (Math.abs(target - jelly) > 0.002) {
		jelly += (target - jelly) * 0.16
		main.style.setProperty("--jelly", jelly.toFixed(3))
	}

	requestAnimationFrame(loop)
}

function eat(element: HTMLElement, x: number, y: number) {
	element.classList.add("gobbled")
	element.addEventListener("animationend", () => element.remove())
	flash("miam", x, y, pick(text().bites))
	pop()

	eaten++
	eatenCounter.hidden = false
	one("b", eatenCounter).textContent = String(eaten)
	const milestone = text().milestones[eaten]
	if (milestone) toast(milestone)
}

function schedulePeek() {
	clearTimeout(peekTimer)
	peekTimer = window.setTimeout(
		() => {
			peeker.style.top = `${18 + Math.random() * 50}%`
			one("span", peeker).textContent = pick(text().peeks)
			peeker.classList.add("out")
			peekTimer = window.setTimeout(() => {
				peeker.classList.remove("out")
				schedulePeek()
			}, 3600)
		},
		9000 + Math.random() * 12000,
	)
}

toggle.addEventListener("click", async () => {
	const on = !loukoum
	const url = new URL(location.href)
	url.searchParams.set("mode", on ? "loukoum" : "serieux")
	history.pushState(null, "", url)
	toggle.disabled = true
	try {
		await sweep(toggle, () => setLoukoum(on), 900)
	} finally {
		toggle.disabled = false
	}
	if (!on) return
	if (!reducedMotion && loukoum) rain(48)
	toast(text().activated)
})

// the button does not let itself be switched off that easily: it runs away, twice
// (not right after the activation though: the pointer is still over it)
toggle.addEventListener("pointerenter", event => {
	if (!loukoum || reducedMotion || event.pointerType != "mouse" || dodges >= 2) return
	if (performance.now() - activatedAt < 4000) return
	dodges++
	toggle.style.translate = `${-120 - Math.random() * 180}px ${-80 - Math.random() * 160}px`
	toast(text().dodges[dodges - 1]!)
	setTimeout(() => (toggle.style.translate = ""), 1500)
})

sweetsLayer.addEventListener("pointerdown", event => {
	const element = event.target as HTMLElement
	if (element.classList.contains("sweet")) eat(element, event.clientX, event.clientY)
})

// in loukoum mode, clicking anywhere makes loukoums pop out of the page
addEventListener("pointerdown", event => {
	if (!loukoum || reducedMotion || (event.target as Element).closest("a, button, pre, .sweet, #portrait")) return
	burst(event.clientX, event.clientY, 3)
})

portrait.addEventListener("click", () => {
	if (!loukoum) return
	const { quotes } = text()
	bubble.textContent = quotes[quoteIndex++ % quotes.length]!

	// removing the class, reading the layout, then adding it back restarts the animation
	for (const element of [portrait, bubble]) {
		element.classList.remove("show")
		void element.offsetWidth
		element.classList.add("show")
	}

	const box = portrait.getBoundingClientRect()
	if (!reducedMotion) burst(box.left + box.width / 2, box.top + box.height * 0.2, 7)
})

peeker.addEventListener("click", () => {
	toast(text().round)
	if (!reducedMotion) rain(24)
})

// Restore the mode from the URL on history navigation and on the initial page load.
addEventListener("popstate", () => setLoukoum(new URLSearchParams(location.search).get("mode") == "loukoum"))
if (root.hasAttribute("data-loukoum")) setLoukoum(true)
else translate()
