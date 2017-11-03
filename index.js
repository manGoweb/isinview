module.exports = class InView {

	/*
		elements = document.querySelectorAll('.dot')
		options = {
			thresholds: [
				{
					threshold: 0, // 0 to 1
					in: (element, entry) => void,
					out: (element, entry) => void,
					once: false,
				},
			],
		}
	*/

	constructor(elements, options) {
		this.elements = elements
		this.thresholds = this.parseThresholds(options)

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

		this.thresholds.forEach((threshold) => {
			let callback = null
			if (intersectionRatio > threshold.threshold) {
				callback = threshold.in
			} else {
				callback = threshold.out
			}
			if (callback) {
				if (threshold.once) {
					this.observer.unobserve(entry.target)
				}
				callback.call(null, entry.target, entry)
			}
		})
	}

}
