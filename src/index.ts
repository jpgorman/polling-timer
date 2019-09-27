const DEFAULT_INTERVAL_MS: number = 1000;

interface ICancellablePromise<T> extends Promise<T> {
  cancel: () => void;
  onCancel: (fn: () => void) => void;
}

const cancelablePromiseFactory = <T>(
  promise: Promise<T>,
): ICancellablePromise<T> => {
  let resolveFn;
  let onCancel;

  let cancel = new Promise<any>(r => {
    resolveFn = r;
  });

  cancel = cancel.then(() => Promise.resolve(new Error('Cancelled')));
  cancel.then(onCancel);

  let cancelablePromise = Promise.race([
    promise,
    cancel,
  ]) as ICancellablePromise<T>;

  cancelablePromise.cancel = () => resolveFn();
  cancelablePromise.onCancel = fn => {
    onCancel = fn;
  };
  return cancelablePromise;
};

export const timer = (
  timeout: number,
  pollingFrequency: number = DEFAULT_INTERVAL_MS,
): ICancellablePromise<number> => {
  let timer: any;
  let diff: number = 0;
  const start = new Date().getTime();

  const cancelablePromise = cancelablePromiseFactory<number>(
    new Promise((resolve, reject) => {
      timer = setInterval(() => {
        diff = new Date().getTime() - start;
        if (timeout <= diff) {
          clearInterval(timer);
          resolve(start);
        }
      }, pollingFrequency);
    }),
  );
  cancelablePromise.onCancel(() => {
    clearInterval(timer);
  });

  return cancelablePromise;
};

export const delay = (
  timeout: number,
  pollingFrequency: number = DEFAULT_INTERVAL_MS,
): ICancellablePromise<number> => timer(timeout, pollingFrequency);

export const timeout = (
  fn: TFunc,
  timeout: number,
  pollingFrequency: number,
) => {
  let cancelablePromise;
  if (cancelablePromise != null) {
    cancelablePromise.cancel();
  }
  return (...args: any): ICancellablePromise<number> => {
    cancelablePromise = timer(timeout, pollingFrequency);
    cancelablePromise.then(() => {
      fn.apply(this, args);
    });

    return cancelablePromise;
  };
};

type TFunc = <T>(args: T) => any;
export const throttle = (
  fn: TFunc,
  timeout: number,
  pollingFrequency: number,
) => {
  let lastRun;
  let lastFunc;
  let cancelablePromise;

  return (...args: any): ICancellablePromise<number> | undefined => {
    const context = this;
    if (!lastRun) {
      console.log('allowed');
      fn.apply(context, args);
      lastRun = Date.now();
    } else {
      if (cancelablePromise != null) {
        cancelablePromise.cancel();
      }

      const countdown = timeout - (Date.now() - lastRun);

      cancelablePromise = timer(countdown, pollingFrequency);
      cancelablePromise.then(() => {
        const throttleTimoutReached = Date.now() - lastRun >= timeout;
        if (throttleTimoutReached) {
          fn.apply(context, args);
          lastRun = Date.now();
        }
      });
      return cancelablePromise;
    }
  };
};

export const debounce = (
  fn: TFunc,
  timeout: number,
  pollingFrequency: number,
) => {
  let cancelablePromise;

  return (...args: any): ICancellablePromise<number> => {
    if (cancelablePromise != null) {
      cancelablePromise.cancel();
    }
    cancelablePromise = timer(timeout, pollingFrequency);
    cancelablePromise.then(res => {
      typeof res === 'number' && fn.apply(this, args);
    });
    return cancelablePromise;
  };
};
