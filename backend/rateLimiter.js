'use strict';

class RateLimiter {
  constructor(requestsPerMinute) {
    this.rpm     = requestsPerMinute;
    this.calls   = [];
    this.queue   = [];
    this.running = false;
  }

  wait() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      if (!this.running) this._process();
    });
  }

  async _process() {
    this.running = true;
    while (this.queue.length > 0) {
      const now = Date.now();
      this.calls = this.calls.filter(t => now - t < 60000);

      if (this.calls.length < this.rpm) {
        this.calls.push(now);
        const resolve = this.queue.shift();
        resolve();
      } else {
        const waitMs = 60000 - (now - this.calls[0]) + 50;
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
    this.running = false;
  }
}

const gptLimiter   = new RateLimiter(10);
const sttLimiter   = new RateLimiter(10);
const ttsLimiter   = new RateLimiter(10);
const imageLimiter = new RateLimiter(3);

module.exports = { gptLimiter, sttLimiter, ttsLimiter, imageLimiter };
