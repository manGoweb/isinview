module.exports = class InView {

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
		this.thresholds = this.parseThresholds(options)

		this.margin = options.margin || null
		this.observer = this.createObserver(this.thresholds)
		this.observe(this.thresholds)
	}


	parseThreshold(data) {
		if (data.threshold || data.in || data.out)
		return {
			threshold: data.threshold || 0,
			in: data.in || null,
			out: data.out || null,
			once: data.once || false,
		}
		return null
	}


	parseThresholds(options) {
		const thresholds = []

		thresholds.push(this.parseThreshold(options))

		if (options.thresholds) {
			options.thresholds.forEach((threshold) => {
				thresholds.push(this.parseThreshold(threshold))
			})
		}

		return thresholds.filter((threshold) => threshold !== null)
	}


	createObserver(thresholds) {
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
			entries.forEach((entry) => this.trigger(entry))
		}, observerOptions)
	}


	observe(thresholds) {
		this.elements.forEach((element) => {
			this.observer.observe(element)
		})
	}


	trigger(entry) {
		const intersectionRatio = entry.intersectionRatio
		const callbacks = []

		this.thresholds.forEach((threshold) => {
			if (intersectionRatio > threshold.threshold) {
				callbacks.push(threshold.in)
			} else {
				callbacks.push(threshold.out)
			}

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
