module.exports = class InView {

	/*
		elements = document.querySelectorAll('.dot')
		options = {
			thresholds: [
				{
					threshold: 0, // 0 to 1
					in: (element, entry) => void,
					out: (element, entry) => void,
					once: true,
				},
			],
		}
	*/

	constructor(elements, options) {
		this.elements = elements
		this.thresholds = this.parseThresholds(options)

		this.observe(this.thresholds)
	}


	parseThreshold(data) {
		if (data.threshold || data.in || data.out)
		return {
			threshold: data.threshold || 0,
			in: data.in || (() => {}),
			out: data.out || (() => {}),
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


	observe(thresholds) {
		const observerOptions = {
			threshold: [],
		}

		thresholds.forEach((threshold) => {
			observerOptions.threshold.push(threshold.threshold)
		})


		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => this.trigger(entry))
		}, observerOptions)

		this.elements.forEach((element) => {
			observer.observe(element)
		})
	}


	trigger(entry) {
		const intersectionRatio = entry.intersectionRatio

		this.thresholds.forEach((threshold) => {
			let callback = null
			if (intersectionRatio > threshold.threshold) {
				callback = threshold.in
				if (threshold.once) {
					// @TODO
				}
			} else {
				callback = threshold.out
				if (threshold.once) {
					// @TODO
				}
			}
			callback.call(null, entry.target, entry)
		})
	}

}
