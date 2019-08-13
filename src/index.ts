const DEFAULT_INTERVAL_MS: number = 1000;

interface ICancellable<T> extends Promise<T> {
  cancel?: () => void;
}

// jsfiddle.net/y7mLbs43

const makeCancelablePromise = <T>(promise: Promise<T>): ICancellable<T> => {
  let resolveFn;

  const wrappedPromise: ICancellable<T> = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    Promise.resolve(promise)
      .then(resolve)
      .catch(reject);
  });

  wrappedPromise.cancel = () => resolveFn({cancelled: true});
  return wrappedPromise;
};

interface ICancellablePromise<T> extends Promise<T> {
  cancel: () => void;
  onCancel: (fn: () => void) => void;
}

const cancelablePromiseFactory = <T>(
  promise: Promise<T>,
): ICancellablePromise<T> => {
  let resolveFn;
  let cancel = new Promise<any>(r => {
    resolveFn = r;
  });

  let onCancel;

  cancel = cancel.then(() => Promise.resolve(new Error('Cancelled')));
  cancel.then(e => {
    console.log('catching', e);
    onCancel();
  });

  let cancelablePromise = Promise.race([
    promise,
    cancel,
  ]) as ICancellablePromise<T>;

  cancelablePromise.cancel = () => resolveFn();
  cancelablePromise.onCancel = fn => {
    console.log(fn);
    onCancel = fn;
  };
  return cancelablePromise;
};

export const timer = (
  timeout: number,
  pollingFrequency: number = DEFAULT_INTERVAL_MS,
): ICancellable<number | void> => {
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
    console.log('onCancel', timer);
    clearInterval(timer);
  });

  return cancelablePromise;
};

export const delay = (
  timeout: number,
  pollingFrequency: number = DEFAULT_INTERVAL_MS,
): ICancellable<number | void> => timer(timeout, pollingFrequency);

type TFunc = <T>(args: T) => any;
export const throttle = (
  fn: TFunc,
  timeout: number,
  pollingFrequency: number,
) => {
  let isThrottled: boolean = false;

  return (args?: any) => {
    if (!isThrottled) {
      fn.apply(null, args);
      isThrottled = true;
      delay(timeout, pollingFrequency).then(() => {
        isThrottled = false;
      });
    }
  };
};

export const debounce = (
  fn: TFunc,
  timeout: number,
  pollingFrequency: number,
) => {
  let cancelablePromise;

  return (args?: any) => {
    if (cancelablePromise != null) {
      cancelablePromise.cancel();
    }
    cancelablePromise = timer(timeout, pollingFrequency);
    cancelablePromise.then(res => {
      console.log(res);
      typeof res === 'number' && fn.apply(null, args);
    });
  };
};
