let scheduledHostCallback = null; // (?) => boolean; flushWork
// flushWork: () => workLoop()
// workLoop: () => boolean


/*
 unstable_scheduleCallback = (callback) => {
  newTask = { callback }
  if () {

  } else {
    taskQueue.push(newTask)
  }

  requestHostCallback(flushWork);

  return newTask;
 }


 flushWork = () => {
  // clean up the taskQueue
  workLoop();

  // loop through and execute all tasks in queue
  workLoop = () => {
    currentTask = taskQueue[0];
    while (currentTask) {
      currentTask.callback();
      taskQueue.shift();
      currentTask = taskQueue[0];
    }
  }
 }



 requestHostCallback(callback) {
  setTimeout(callback);
 }
*/



// register
let scheduledHostCallback = null;
function requestHostCallback(callback) {
  // put the callback in global name (heap?)
  scheduledHostCallback = callback;
  // trigger it next time
  schedulePerformWorkUntilDeadline();
}

const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    let hasMoreWork = true;
    hasMoreWork = scheduledHostCallback();
    if (hasMoreWork) {
      // If there's more work, schedule the next message event at the end
      // of the preceding one.
      schedulePerformWorkUntilDeadline();
    } else {
      scheduledHostCallback = null;
    }
  }
};


/**schedulePerformWorkUntilDeadline */
const channel = new MessageChannel();
channel.port1.onmessage = performWorkUntilDeadline;
const schedulePerformWorkUntilDeadline = () => {
    channel.port2.postMessage(null);
}


/**----------------- */
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();

  var startTime;
  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  var timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  var expirationTime = startTime + timeout;

  // create a task
  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // Schedule a timeout.
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}

function flushWork(hasTimeRemaining, initialTime) {
  try {
    // No catch in prod code path.
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}


function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);
  while (
    currentTask !== null &&
    !(enableSchedulerDebugging && isSchedulerPaused)
  ) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      if (enableProfiling) {
        markTaskRun(currentTask, currentTime);
      }
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
        if (enableProfiling) {
          markTaskYield(currentTask, currentTime);
        }
      } else {
        if (enableProfiling) {
          markTaskCompleted(currentTask, currentTime);
          currentTask.isQueued = false;
        }
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }
    currentTask = peek(taskQueue);
  }
  // Return whether there's additional work
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

var currentTask = null;
var currentTime;

function workLoop() {
  currentTask = taskQueue[0];
  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&  // task has not expired
      (!hasTimeRemaining || shouldYieldToHost()) // no time remained
    ) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }

    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      // find a valid task
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout); // what is a callback?!

      currentTime = getCurrentTime();

      if (typeof continuationCallback === 'function') {
        // still need to do sth? reset to current task
        currentTask.callback = continuationCallback;
      } else {
        // we are good, we are done, pop it
        if (currentTask === taskQueue[0]) {
          taskQueue.shift();
        }
      }
    } else {
      // not valid just pop
      taskQueue.shift();
    }

    currentTask = taskQueue[0];
  }
}


function workLoop_simplfied() {
  currentTask = taskQueue[0];
  while (currentTask) {
    const callback = currentTask.callback;
    const nextStep = callback();
    if (typeof nextStep === 'function') {
      currentTask.callback = nextStep;
    } else {
      taskQueue.shift();
    }

    currentTask = taskQueue[0];
  }
}