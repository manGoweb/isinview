type Callback = (element: HTMLElement, entry: any) => void

export interface IsInViewOptions {
	threshold?: number
	thresholds?: number[]
	in?: Callback
	inTop?: Callback
	inBottom?: Callback
	out?: Callback
	outTop?: Callback
	outBottom?: Callback
	margin?: string
	once?: boolean
}

export default class IsInView {
	/*
		elements = document.querySelectorAll('.dot')
		options = {
			thresholds: [
				{
					threshold: 0, // 0 to 1
					in: (element, entry) => void,
					inTop: (element, entry) => void,
					inBottom: (element, entry) => void,
					in: (element, entry) => void,
					out: (element, entry) => void,
					outTop: (element, entry) => void,
					outBottom: (element, entry) => void,
					margin: '10px 20px 30px 40px',
					once: false,
				},
			],
		}
	*/

	private elements: NodeListOf<HTMLElement> | HTMLElement[]
	private thresholds: any
	private margin: any
	private observer: IntersectionObserver

	constructor(
		elements: HTMLElement | NodeListOf<HTMLElement> | HTMLElement[],
		options: IsInViewOptions
	) {
		this.elements = elements instanceof HTMLElement ? [elements] : elements
		this.thresholds = this._parseThresholds(options)

		this.margin = options.margin || null
		this.observer = this._createObserver(this.thresholds)
		this._observe()
	}

	public destroy() {
		this.elements.forEach((element: HTMLElement) => {
			this.observer.unobserve(element)
		})
	}

	private _parseThreshold(data: any) {
		if (data.threshold || data.in || data.out) {
			return {
				threshold: data.threshold || 0,
				in: data.in || null,
				inTop: data.inTop || null,
				inBottom: data.inBottom || null,
				out: data.out || null,
				outTop: data.outTop || null,
				outBottom: data.outBottom || null,
				once: data.once || false,
			}
		}
		return null
	}

	private _parseThresholds(options: IsInViewOptions) {
		const thresholds = []

		thresholds.push(this._parseThreshold(options))

		if (options.thresholds) {
			options.thresholds.forEach((threshold) => {
				thresholds.push(this._parseThreshold(threshold))
			})
		}

		return thresholds.filter((threshold) => threshold !== null)
	}

	private _createObserver(thresholds: any) {
		const observerOptions = {
			threshold: [],
		}

		if (this.margin) {
			// @ts-ignore
			observerOptions.rootMargin = this.margin
		}

		thresholds.forEach((threshold: any) => {
			// @ts-ignore
			observerOptions.threshold.push(threshold.threshold)
		})

		return new IntersectionObserver((entries) => {
			entries.forEach((entry) => this._trigger(entry))
		}, observerOptions)
	}

	private _observe() {
		this.elements.forEach((element: HTMLElement) => {
			this.observer.observe(element)
		})
	}

	private _trigger(entry: any) {
		const intersectionRatio = entry.intersectionRatio
		let callbacks: Callback[] = []
		const rect = entry.boundingClientRect
		const fromTop = rect.top + rect.height / 2 < window.innerHeight / 2

		this.thresholds.forEach((threshold: any) => {
			if (intersectionRatio >= threshold.threshold) {
				callbacks.push(threshold.in)

				if (fromTop) {
					callbacks.push(threshold.inTop)
				} else {
					callbacks.push(threshold.inBottom)
				}
			} else {
				callbacks.push(threshold.out)

				if (fromTop) {
					callbacks.push(threshold.outTop)
				} else {
					callbacks.push(threshold.outBottom)
				}
			}

			callbacks = callbacks.filter((callback) => callback !== null)
			if (callbacks.length) {
				if (threshold.once) {
					this.observer.unobserve(entry.target)
				}
				callbacks.forEach((callback) => {
					callback.call(null, entry.target, entry)
				})
			}
		})
	}
}
