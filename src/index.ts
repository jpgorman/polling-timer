const DEFAULT_INTERVAL_MS: number = 1000


export default (delay: number, interval: number = DEFAULT_INTERVAL_MS): Promise<number> => {
  let timer: any
  let diff:number = 0
  const start = new Date().getTime()

  const promise = new Promise<number>(resolve => {
    timer = setInterval(() => {
      diff = new Date().getTime() - start
      if(delay <= diff) {
        clearInterval(timer) 
        resolve(start)
      }
    }, interval)
  
  })
  return promise
}
