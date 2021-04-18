

/**
 * 
 * @param {str|function} type 
 * @param {*} props 
 * @param  {...any} children 
 */
function createElement(type, props, ...children) {
    return {
        type: 'div',
        props: {
            ...props,
            children,
        },
    }
}

/**
 * 
 * @param {react element, aka vdom?} element 
 * @param {dom} container 
 */
function render(element, container) {
    const dom = document.createElement(element.type);
    dom.innerHTML = element.props.children[0];

    container.appendChild(dom);
}


/**============NOTE================ 
 * 
 * I know the limitation of recursive tree call, not going to discuss here, we go into fiber directly
 * at this moment the most difficult thing in my mind is how to abstract away "diff" from a tree like structure
 * we need some kind of visitor pattern
 * 
 * 
 * let's first make an iteractor for a fiber structure
 * a fiber should be at least like { parent, child, sibling }
 * 
 *  a
 * || \\
 * b =  c 
 * || \\
 * d=e=f
 * 
 * 
 * **/

function Fiber(val) {
    this.val = val;
    this.parent = this.child = this.sibling = null;
}

const a = new Fiber('a');
const b = new Fiber('b');
const c = new Fiber('c');
const d = new Fiber('d');
const e = new Fiber('e');
const f = new Fiber('f');

a.child = b;
b.sibling = c; c.parent = a;
b.child = d; d.sibling = e; e.sibling = f; f.parent = b;

function getNext(fiber) {
    // look down
    if (fiber.child) {
        console.log('look down find ', fiber.child.val);
        return fiber.child;
    }
    // look right (so sibling chance is done here) in advance
    if (fiber.sibling) {
        console.log('look right find ', fiber.sibling.val);
        return fiber.sibling;
    }

    // look upward
    let curr = fiber.parent;
    while (curr) {
        // look parent right, so this loop is only going to return first sibling
        if (curr.sibling) {
            console.log('in loop find', curr.sibling.val);
            return curr.sibling;
        }
        // if not, look upward
        curr = curr.parent;
    }

    return null;
}


function getNext(fiber) {
    // look down
    if (fiber.child) {
        console.log('look down find ', fiber.child.val);
        return fiber.child;
    }

    let search = fiber;
    // try to look right
    while (search) { 
        // while loop 可能返回的不只是parent的第一个siblining
        // 可能 search.parent在很长时间都不会touch
        // 那么 他返回的就一直是next 也就是说while loop返回的东西定义可能不同 这也是为什么他难理解的原因
        if (search.sibling) {
            console.log('in loop find ', search.sibling.val);
            return search.sibling;
        }
        // if not, look upward
        search = search.parent;
    }
    // understand the while loop as a try to look right, dont even think about parent
    return null;
}





const React = {
    createElement,
}

const ReactDOM = {
    render,
}
export {
    React,
    ReactDOM,
}