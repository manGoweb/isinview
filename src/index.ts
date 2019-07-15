export namespace IsInView {

	export interface Options {
		once: boolean,
		threshold: number,
	}

	export interface Details {
		isAboveView: boolean
		isInView: boolean
		isBelowView: boolean
	}

	export type Callback = (target: Element, details: Details) => void
	export type Target = Element | NodeListOf<Element>
	export type CallbackRegistrar = (target: IsInView.Target, callback: IsInView.Callback, options?: Partial<IsInView.Options>) => void
}

const defaultOptions: IsInView.Options = {
	once: false,
	threshold: 0,
}

interface TargetsIterable {
	[index: number]: Element

	length: number
}

const buildOptions = function (options: Partial<IsInView.Options>): IsInView.Options {
	return {
		...defaultOptions,
		...options,
	}
}

const observe = function (target: IsInView.Target, observer: IntersectionObserver) {
	const targets: TargetsIterable = target instanceof Element ? [target] : target

	for (let i = 0; i < targets.length; i++) {
		observer.observe(targets[i])
	}
}

const createObserver = function (callback: IsInView.Callback, options: IsInView.Options, condition: (entry: IntersectionObserverEntry) => boolean): IntersectionObserver {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const target = entry.target
			if (condition(entry)) {
				callback(target, {
					isAboveView: entry.boundingClientRect.bottom < entry.rootBounds.height / 2 && entry.boundingClientRect.top < 0,
					isInView: entry.isIntersecting,
					isBelowView: entry.boundingClientRect.top > entry.rootBounds.height / 2 && entry.boundingClientRect.bottom > entry.rootBounds.height,
				})
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

export function isSupported() {
	return 'IntersectionObserver' in window
}

export const isInView: IsInView.CallbackRegistrar = function (target, callback, options = {}) {
	const completeOptions = buildOptions(options)
	const observer = createObserver(callback, completeOptions, (entry: IntersectionObserverEntry) => entry.isIntersecting)
	observe(target, observer)
}

export const isOutOfView: IsInView.CallbackRegistrar = function (target, callback, options = {}) {
	const completeOptions = buildOptions(options)
	const observer = createObserver(callback, completeOptions, (entry: IntersectionObserverEntry) => !entry.isIntersecting)
	observe(target, observer)
}
