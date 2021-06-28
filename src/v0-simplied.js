/**
 * 
 * 
 * https://github.com/facebook/react/pull/8833
 * 
 * 
 * | frame start time                                      deadline |
   [requestAnimationFrame] [layout] [paint] [composite] [postMessage]
 * 
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

 'use strict';

 /**
  * A scheduling library to allow scheduling work with more granular priority and
  * control than requestAnimationFrame and requestIdleCallback.
  * Current TODO items:
  * X- Pull out the rIC polyfill built into React
  * ric = () => requestAnimationFrame(animationFram)
  */
 
 // This is a built-in polyfill for requestIdleCallback. It works by scheduling
 // a requestAnimationFrame, storing the time for the start of the frame, then
 // scheduling a postMessage which gets scheduled after paint. Within the
 // postMessage handler do as much work as possible until time + frame rate.
 // By separating the idle call into a separate event tick we ensure that
 // layout, paint and other browser work is counted against the available time.
 // The frame rate is dynamically adjusted.
 
 let now = performance.now();

 // TODO: There's no way to cancel, because Fiber doesn't atm.
 let rIC; // (callback) => number;
 let cIC;// (callbackID: number) => void;
 

    // Polyfill requestIdleCallback and cancelIdleCallback
  
    let scheduledRICCallback = null;
    let isIdleScheduled = false;
    let timeoutTime = -1;
  
    let isAnimationFrameScheduled = false;
  
    let frameDeadline = 0;
    // We start out assuming that we run at 30fps but then the heuristic tracking
    // will adjust this value to a faster fps if we get more frequent animation
    // frames.
    let previousFrameTime = 33;
    let activeFrameTime = 33;
    
    // singleton???
    let frameDeadlineObject;
    frameDeadlineObject = {
        didTimeout: false,
        timeRemaining() {
            // We assume that if we have a performance timer that the rAF callback
            // gets a performance timer value. Not sure if this is always true.
            const remaining = frameDeadline - performance.now();
            return remaining > 0 ? remaining : 0;
        },
    };

    // We use the postMessage trick to defer idle work until after the repaint.
    const messageKey =
      '__reactIdleCallback$' +
      Math.random()
        .toString(36)
        .slice(2);
    
    // trigger after frame | paint
    const idleTick = function(event) {
      if (event.source !== window || event.data !== messageKey) {
        return;
      }
      // toggle back to false, deal with it now
      isIdleScheduled = false;
      
      const currentTime = now();
      if (frameDeadline - currentTime <= 0) { // expired
        // There's no time left in this idle period. Check if the callback has
        // a timeout and whether it's been exceeded.
        if (timeoutTime !== -1 && timeoutTime <= currentTime) {
          // Exceeded the timeout. Invoke the callback even though there's no
          // time left.
          frameDeadlineObject.didTimeout = true;
        } else {
          // No timeout.
          if (!isAnimationFrameScheduled) {
            // Schedule another animation callback so we retry later.
            isAnimationFrameScheduled = true;
            requestAnimationFrame(animationTick);
          }
          // Exit without invoking the callback.
          return;
        }
      } else {
        // There's still time left in this idle period.
        frameDeadlineObject.didTimeout = false;
      }
  
      timeoutTime = -1;
      const callback = scheduledRICCallback;
      scheduledRICCallback = null;
      if (callback !== null) {
        callback(frameDeadlineObject);
      }
    };
    // Assumes that we have addEventListener in this environment. Might need
    // something better for old IE.
    window.addEventListener('message', idleTick, false);
  
    // 单纯在update一些frame的timing
    const animationTick = function(rafTime) {
      // step1: toggle back to false, deal with it
      isAnimationFrameScheduled = false;
      // rafTime = performance.now on the frame, 也就是这个callback的时刻
      let nextFrameTime = rafTime - frameDeadline + activeFrameTime;
      //  ?? 5s + .33 = 5.33 但我们这个frame的deadline是5.2才结束。。所以离下一个frame 5 - 5.2 + 0.33 = 0.13?
      if (
        nextFrameTime < activeFrameTime &&
        previousFrameTime < activeFrameTime
      ) {
        if (nextFrameTime < 8) {
          // Defensive coding. We don't support higher frame rates than 120hz.
          // If we get lower than that, it is probably a bug.
          nextFrameTime = 8;
        }
        // If one frame goes long, then the next one can be short to catch up.
        // If two frames are short in a row, then that's an indication that we
        // actually have a higher frame rate than what we're currently optimizing.
        // We adjust our heuristic dynamically accordingly. For example, if we're
        // running on 120hz display or 90hz VR display.
        // Take the max of the two in case one of them was an anomaly due to
        // missed frame deadlines.
        activeFrameTime =
          nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
      } else {
        previousFrameTime = nextFrameTime;
      }
      // always...use all?
      frameDeadline = rafTime + activeFrameTime;
      // 如果没有scheule 就发出 真正的callback
      if (!isIdleScheduled) {
        isIdleScheduled = true;
        window.postMessage(messageKey, '*');
      }
    };
  
    rIC = function(
      callback, // (deadline: Deadline) => void,
      options, // ?{timeout: number},
    ) {
      // This assumes that we only schedule one callback at a time because that's
      // how Fiber uses it.
      // step1: assign to global
      scheduledRICCallback = callback;
      // step2: calculate timeoutTime
      if (options != null && typeof options.timeout === 'number') {
        timeoutTime = now() + options.timeout;
      }
      // step3: only request an frame, if not yet
      if (!isAnimationFrameScheduled) {
        // If rAF didn't already schedule one, we need to schedule a frame.
        // TODO: If this rAF doesn't materialize because the browser throttles, we
        // might want to still have setTimeout trigger rIC as a backup to ensure
        // that we keep performing work.
        isAnimationFrameScheduled = true;
        requestAnimationFrame(animationTick);
      }
      return 0;
    };
  
    cIC = function() {
      scheduledRICCallback = null;
      isIdleScheduled = false;
      timeoutTime = -1;
    };
   

 
 export {now, rIC, cIC};
 