import timer from '../index'


describe('timer', () => {
  it('Should resolve start time of timer', async () => {
    const now = new Date().getTime()
    const res = await timer(10, 1)
    expect(now).toBe(res)
  })

  it('Should resolve ONLY after delay', async () => {
  
    const res = await timer(10, 1)
    const now = new Date().getTime()
    expect(now).toBeGreaterThanOrEqual(res + 10)
  })
})
