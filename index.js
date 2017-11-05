module.exports = class IsInView {

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

	constructor(elements, options) {
		this.elements = elements
		this.thresholds = this._parseThresholds(options)

		this.entries = []

		this.margin = options.margin || null
		this.observer = this._createObserver(this.thresholds)
		this._observe(this.thresholds)
	}


	destroy() {
		this.elements.forEach((element) => {
			this.observer.unobserve(element)
		})
	}


	_parseThreshold(data) {
		if (data.threshold || data.in || data.out)
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
		return null
	}


	_parseThresholds(options) {
		const thresholds = []

		thresholds.push(this._parseThreshold(options))

		if (options.thresholds) {
			options.thresholds.forEach((threshold) => {
				thresholds.push(this._parseThreshold(threshold))
			})
		}

		return thresholds.filter((threshold) => threshold !== null)
	}


	_createObserver(thresholds) {
		const observerOptions = {
			threshold: [],
		}

		if (this.margin) {
			observerOptions.rootMargin = this.margin
		}

		thresholds.forEach((threshold) => {
			observerOptions.threshold.push(threshold.threshold)
		})

		return new IntersectionObserver((entries) => {
			entries.forEach((entry) => this._trigger(entry))
		}, observerOptions)
	}


	_observe(thresholds) {
		this.elements.forEach((element) => {
			this.observer.observe(element)
		})
	}


	_trigger(entry) {
		const intersectionRatio = entry.intersectionRatio
		const callbacks = []
		const rect = entry.boundingClientRect
		const fromTop = rect.top + rect.height / 2 < window.innerHeight / 2

		this.thresholds.forEach((threshold) => {
			if (intersectionRatio > threshold.threshold) {
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

			callbacks.filter((callback) => callback !== null)
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
