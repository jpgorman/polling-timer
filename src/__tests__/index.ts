import {delay, throttle, debounce, timeout, timer} from '../index';

describe('timer', () => {
  it('Should return a promise that resolves after given delay', async () => {
    const res = await timer(10, 1);
    expect(Number.isInteger(res)).toBe(true);
  });
  it('Should return a promise that can be cancelled', () => {
    const res = timer(10, 1);
    res.cancel();
    res.then(e => {
      expect(e).toEqual(new Error('Cancelled'));
    });
  });
});

describe('delay', () => {
  it('Should resolve start time of timer', async () => {
    const now = new Date().getTime();
    const res = await delay(10, 1);
    expect(now).toBeCloseTo(res);
  });
});

describe('timeout', () => {
  it('Should only call the supplied function once the timeout has passed', async () => {
    const mockFn = jest.fn();
    const res = timeout(mockFn, 20, 1);
    res();
    await delay(20, 1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
  it('Can be cancelled', () => {
    const mockFn = jest.fn();
    const res = timeout(mockFn, 20, 1);
    const promise = res();
    promise.cancel();
    promise.then(e => {
      expect(e).toEqual(new Error('Cancelled'));
    });
  });
});

describe('throttle', () => {
  it('Should only allow for function to be called once between timeouts', async () => {
    const mockFn = jest.fn();
    const res = throttle(mockFn, 20, 1);
    res();
    await delay(10, 1);
    res();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
  it('Can be cancelled', () => {
    const mockFn = jest.fn();
    const res = throttle(mockFn, 20, 1);
    res();
    const promise = res();
    promise.cancel();
    promise.then(e => {
      expect(e).toEqual(new Error('Cancelled'));
    });
  });
});

describe('debounce', () => {
  it('Should wait until the timeout has passed before the function can be called', async () => {
    const mockFn = jest.fn();
    const res = debounce(mockFn, 10, 1);
    res();
    await delay(5, 1);
    res();
    await delay(11, 1);
    res();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
  it('Can be cancelled', () => {
    const mockFn = jest.fn();
    const res = debounce(mockFn, 20, 1);
    const promise = res();
    promise.cancel();
    promise.then(e => {
      expect(e).toEqual(new Error('Cancelled'));
    });
  });
});
