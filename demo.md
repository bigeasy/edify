What would literate programming look like with Markdown as the base? Would
Markdown be the right language?

```javascript
//{ "name": "displayedRequire", "mode": "text" }
const Queue = require('avenue')
```

```javascript
//{ "name": "testRequire", "mode": "code" }
const Queue = require('..')
```

This `README.md` is also a unit test using the Proof unit test framework. We'll
use the Proof `okay` function to assert out statements in the readme. A Proof
unit test generally looks like this.

```javascript
//{ "code": { "tests": 8 }, "text": { "tests": 4 } }
require('proof')(%(tests)d, async okay => {
    //{ "name": "testRequire" }
    //{ "include": "test" }
    okay('always okay')
    okay(true, 'okay if true')
    okay(1, 1, 'okay if equal')
    okay({ value: 1 }, { value: 1 }, 'okay if deep strict equal')
})
```

If you want to stream a shifter into a queue with back-pressure you can the
`Shifter.async.push()` method.


```javascript
//{ "unblock": true, "name": "test" }
{
    const from = new Queue
    const to = new Queue
    const shifter = to.shifter()
    const promise = from.shifter().pump(value => to.push(value))
    await from.enqueue([ 1, 2, 3, null ])
    await promise
    okay(shifter.sync.splice(4), [ 1, 2, 3 ], 'pushed')
    okay(shifter.destroyed, 'received terminator')
}
```

If you want to stream a shifter into a queue without terminating the queue you
use `Queue.consume`.

```javascript
//{ "unblock": true, "name": "test" }
{
    const from = new Queue
    const to = new Queue
    const shifter = to.shifter()
    const promise = from.consume(to)
    await from.enqueue([ 1, 2, 3, null ])
    await promise
    okay(shifter.sync.splice(4), [ 1, 2, 3 ], 'pushed')
    okay(shifter.destroyed, 'received terminator')
}
```
