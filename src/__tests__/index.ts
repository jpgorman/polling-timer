import {delay, throttle, debounce} from '../index';

describe('delay', () => {
  it('Should resolve start time of timer', async () => {
    const now = new Date().getTime();
    const res = await delay(10, 1);
    expect(now).toBeCloseTo(res);
  });
});

describe('throttle', () => {
  it('Should only call the supplied function once the timeout has passed', async () => {
    const mockFn = jest.fn();
    const res = throttle(mockFn, 20, 1);
    res();
    await delay(10, 1);
    res();
    expect(mockFn).toHaveBeenCalledTimes(1);
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
});
