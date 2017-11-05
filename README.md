# Isinview

Watch elements entering or leaving viewport

## How to use

```javascript
import IsInView from 'isinview'

new IsInView(document.querySelectorAll('.target'), {
	threshold: 0.7, // 0 to 1
	in: (el, entry) => console.log(Math.floor(entry.time), 'in', el.innerHTML),
	out: (el, entry) => console.log(Math.floor(entry.time), 'out', el.innerHTML),
	once: true,
})
```
