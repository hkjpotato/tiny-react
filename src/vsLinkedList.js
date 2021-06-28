const map = {};
const queue = {};

callIt = (callback) => {
    if (!map[callback.id]) {
        return;
    }
    callback.fn();
    delete map[callback.id];
}

trigger = () => {
    for (let i = 0, len = queue.length; i < len; i++) {
        callIt(queue[i]);
    }
}

const printList = (head) => {
    let curr = head;
    while (curr) {
        console.log(curr.val);
        curr = curr.next;
        if (curr === head) {
            break;
        }
    }
}

var a = {val: 1 }, b = {val: 2}, c = {val: 3};
a.next = b, b.next = c, c.next = a;
a.prev = c, b.prev = a, c.prev = b;

trigger2 = () => {
    curr = head;
    while (curr && curr.next !== head) {
        if (curr) {
            curr.fn();
            cancel(curr);
        }
        curr = curr.next;
    }
}

// not for here, because you dont blindly call and remove always
// another thing is perhaps the order is not guaranteed, there is a chance you need to pop [2] but want to keep [1]
// unless they are ordered...min heap
// wait..maybe it is for cancelling/deletion 
trigger3 = () => {
    while(queue.length !== 0) {
        curr = queue.shift();
        curr.fn();
    }
}
// 这个问题在与这不是真正的queue 这里面的顺序是乱的

cancel = (curr) => {
    // const next = curr.next;
    // const prev = curr.prev;
    if(curr.next === curr && curr.prev === curr) {
        return;
    }
    // normal case
    curr.next.prev = curr.prev;
    curr.prev.next = curr.next;
    curr.next = null;
    curr.prev = null;
}