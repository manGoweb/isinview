module.exports = class InView {

	/*
		options = {
			element: document.querySelectorAll('.dot'),
			thresholds: [
				{
					threshold: 0, // 0 to 1
					in: (element) => void,
					out: (element) => void,
					once: true,
				},
			],

		}

	*/

	constructor(options) {
		this.element = options.element
		this.thresholds = this.parseThresholds(options)
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

		options.thresholds.forEach((threshold) => {
			thresholds.push(this.parseThreshold(threshold))
		})

		return thresholds.filter((threshold) => threshold !== null)
	}

}
