export function isSupported() {
	return 'IntersectionObserver' in window
}

type Callback = (target: Element) => void
type Target = Element | NodeListOf<Element>

interface Options {
	once: boolean,
	threshold: number,
}

const defaultOptions: Options = {
	once: false,
	threshold: 0,
}

type Func = (target: Target, callback: Callback, options?: Partial<Options>) => void

interface TargetsIterable {
	[index: number]: Element

	length: number
}

const buildOptions = function (options: Partial<Options>[]): Options {
	let result: Options = defaultOptions

	for (let i = 0; i < options.length; i++) {
		result = {
			...result,
			...options[i],
		}
	}

	return result
}

const observe = function (target: Target, observer: IntersectionObserver) {
	const targets: TargetsIterable = target instanceof Element ? [target] : target

	for (let i = 0; i < targets.length; i++) {
		observer.observe(targets[i])
	}
}

const createObserver = function (callback: Callback, options: Options, condition: (entry: IntersectionObserverEntry) => boolean): IntersectionObserver {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const target = entry.target
			if (condition(entry)) {
				callback(target)
				if (options.once) {
					observer.unobserve(target)
				}
			}
		})
	}, {
		threshold: options.threshold,
	})
	return observer
}

export const isInView: Func = function (target, callback, options = {}) {
	const completeOptions = buildOptions([options])
	const observer = createObserver(callback, completeOptions, (entry: IntersectionObserverEntry) => entry.isIntersecting)
	observe(target, observer)
}

export const isOutOfView: Func = function (target, callback, options = {}) {
	const completeOptions = buildOptions([options])
	const observer = createObserver(callback, completeOptions, (entry: IntersectionObserverEntry) => !entry.isIntersecting)
	observe(target, observer)
}
