# polling-timers

[![Build Status](https://travis-ci.org/jpgorman/polling-timer.svg?branch=master)](https://travis-ci.org/jpgorman/polling-timer)

## Summary

`polling-timers` offers a number of async timers that allow for more precise handling of timeouts. In addition they are aware of what moment in time they were started. This means that if an OS goes into hibernation, when it awakes the timers will know if they should have timedout within the hibernation period. A good example of this, is backgrounding an app or working in a separate browser tab.

## Installation

Install with `npm i polling-timers` or with yarn  `yarn add polling-timers`.

## Usage
The API for `polling-timers` is simply a factory that returns a promise that will resolve once the timer has completed. Additionally this promise is cancellable if you need to terminate a timer early.

#### delay

Returns a promise with the following additional methods:

```js

import {delay} from 'polling-timers'

const delayForOneSecond = 1000
const whenDelayHasExpired = delay(delayForOneMilliSecond)

whenDelayHasExpired.then(() => {
    console.log('do something')
})

// the timer can be cancelled at any point
whenDelayHasExpired.cancel().onCancel(() =>  console.log('cancelled'))

```

#### timeout

```js

import {timeout} from 'polling-timers'

const delayForOneSecond = 1000
const thingToDo = (args) => {
    console.log('called with', args)
}
const startTimeout = timeout(thingToDo, delayForOneMilliSecond)
startTimeout('me!')

# output after 1 sec
'called with me!'
```

#### throttle

A timer that will not invoke its given function until the timeout has been reached.

```js

import {throttle} from 'polling-timers'

const throttleForOneSecond = 1000
const thingToDo = (args) => {
    console.log('called with', args)
}
const startThrottling = throttle(thingToDo, throttleForOneSecond)

async function() {
    startThrottling('me!')
    startThrottling('me!')
    startThrottling('me!')
    await delay(1000)
    startThrottling('me!') // <-- only this call will be invoked
}

# output
'called with me!' is only printed once
```

#### debounce

Returns a timer that restarts if the timer is invoked before the debounce timeout has been reached

```js

import {debounce} from 'polling-timers'

const debounceForOneSecond = 2000
const thingToDo = (args) => {
    console.log('called with', args)
}
const startDebouncing = debounce(thingToDo, debounceForOneSecond)

async function() {
    startDebouncing('me!') // <-- thingToDo is not called and timer is restarted
    await delay(1000)
    startDebouncing('me!') // <-- thingToDo is not called and timer is restarted
    await delay(2000)
    startDebouncing('me!') // <-- thingToDo is called
}

# output
'called with me!' is only printed once
```

## Api

#### delay

Returns a cancellable promise that will resolve once a given delay has passed

Arguments:

| Argument | Type   | Optional | Description            |
| -------- | ------ | -------- | ---------------------- |
| timeout     | Number | No     | Number of milliseconds delay should last. |
| frequency     | Number | Yes     | Milliseconds between each poll of the timer. Defaults to 1000 milliseconds. |

Returns a promise with the following additional methods:

| Argument | Type   | Description            |
| -------- | ------ |  ---------------------- |
| cancel     | Function | Method used to cancel delay timer. |
| onCancel     | Function | Accepts a callback that will be called if the promise is called. |

```js
const tenSeconds = 10000
const pollEverySecond = 1000
const timer = delay(tenSeconds, pollEverySecond)

timer.then(() => {
    console.log('Delay complete')
})

timer.canel()
timer.onCancel(() => console.log('cancelled'))

```

#### timeout

Returns a function that when called starts the timer that. All arguments passed to the timer will be passed to the callback.

Arguments:

| Argument | Type   | Optional | Description            |
| -------- | ------ | -------- | ---------------------- |
| callback     | Function | No     | Function that will be called once the timeout period has expired. |
| timeout     | Number | No     | Number of milliseconds delay should last. |
| frequency     | Number | Yes     | Milliseconds between each poll of the timer. Defaults to 1000 milliseconds. |

```js
import {timeout} from 'polling-timers'

const callback = (args) => console.log(args)
const tenSeconds = 10000
const pollEverySecond = 1000

const timer = timeout(callback, tenSeconds, pollEverySecond)
timer('foo')

# after 10 secs outputs `foo`
```

#### throttle

Returns a function that when called starts the timer that prevents calls to it's callback function until the timeout has expired. All arguments passed to the timer will be passed to the callback.

If the timer is called again before it's timeout has expire, the previous timer will be cancelled and a new one will be started in it's place.

Arguments:

| Argument | Type   | Optional | Description            |
| -------- | ------ | -------- | ---------------------- |
| callback     | Function | No     | Function that will be called once the timeout period has expired. |
| timeout     | Number | No     | Number of milliseconds delay should last. |
| frequency     | Number | Yes     | Milliseconds between each poll of the timer. Defaults to 1000 milliseconds. |

```js
import {throttle} from 'polling-timers'

const callback = (args) => console.log(args)
const tenSeconds = 10000
const pollEverySecond = 1000

const timer = throttle(callback, tenSeconds, pollEverySecond)
timer('bar') 
await delay(tenSeconds)
timer('foo')

# after 10 secs outputs `foo`
```

#### debounce

Returns a function that when called will restart the timer and wait again for timout period to expire before calling the callback method. All arguments passed to the timer will be passed to the callback.

If the timer is restarted, the previous timer will be cancelled and a new one will be started in it's place.

Arguments:

| Argument | Type   | Optional | Description            |
| -------- | ------ | -------- | ---------------------- |
| callback     | Function | No     | Function that will be called once the timeout period has expired. |
| timeout     | Number | No     | Number of milliseconds delay should last. |
| frequency     | Number | Yes     | Milliseconds between each poll of the timer. Defaults to 1000 milliseconds. |

```js
import {debounce} from 'polling-timers'

const callback = (args) => console.log(args)
const oneSecond = 10000
const tenSeconds = 10000
const pollEverySecond = 1000

const timer = debounce(callback, tenSeconds, pollEverySecond)
timer('bar') // starts timer
await delay(oneSecond)
timer('foo') // restarts timer
await delay(tenSeconds)

# after 10 secs outputs `foo`
```

