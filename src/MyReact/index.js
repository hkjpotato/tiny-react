

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
    // try look down
    if (fiber.child) {
        return fiber.child;
    }

    let nodeToLookRight = fiber;
    while (nodeToLookRight) {
        // try look right first
        if (nodeToLookRight.sibling) {
            return nodeToLookRight.sibling;
        }

        // if not, look upward then try again
        nodeToLookRight = nodeToLookRight.parent;
    }
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