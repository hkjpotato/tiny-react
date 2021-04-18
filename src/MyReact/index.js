

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
 * [1]let's first make an iteractor for a fiber structure
 * a fiber should be at least like { parent, child, sibling }
 * 
 *  a
 * || \\
 * b =  c 
 * || \\
 * d=e=f
 * 
 * [2]once you know we need this fiber structure (yeah we know in advance), 
 * the tricky part is how to build it while traversing the tree
 * 
 * so .. we can base on an existing vDom tree structure, build the next function for traversing it
 * the fiber structure is build in time
 * 
 * 
 * [3]about the real dom
 * ok now ..when to render it? we know we can call ReactDOM.render to trigger a real dom render
 * but what exactly does it do? Now in the render function we simply do: 
 * 1. create dom node with given vDom
 * 2. and append it to container
 * 
 * we probably want to change our mindset here:
 * we already know how to traverse the vdom tree incrementally, once it is done
 * we should get a queue of dom action, and we then will commit it
 * maybe..we should store the dom action directly with the fiber? after all fiber ..is a storage?
 * 
 * [4] OperationFiber
 * **/

// [1]
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

// assume we dont have fiber at first
function Node(val) {
    this.val = val;
    this.children = [];
}

const aN = new Node('a');
const bN = new Node('b');
const cN = new Node('c');
const dN = new Node('d');
const eN = new Node('e');
const fN = new Node('f');
aN.children = [bN, cN];
bN.children = [dN, eN, fN];


const rootFiber = {
    node: aN,
    child: null,
    sibling: null,
    parent: null,
}

// [2]
// only deal with first level of children
const dealWithChildren = (rootFiber) => {
    if (rootFiber.node.children.length !== 0) {
        const getChildFiberTemplate = (node) => {
            return {
                parent: rootFiber, // known parent
                sibling: null,
                child: null,
                node, 
            }
        };

        const children = rootFiber.node.children;

        let prevSibling = getChildFiberTemplate(children[0]);
        rootFiber.child = prevSibling;

        for (var i = 1; i < children.length; i++) {
            const curr = getChildFiberTemplate(children[i]);
            prevSibling.sibling = curr;
            prevSibling = curr;
        }
    }
}

function getNext(fiber) {
    // we need to do sth before get to next
    // what do we want to do?
    // lets first try to build the next fiber while..traversing the tree
    // what is the tree? what is we are trying to build incrementally?
    // at this moment, tree is the vDom which we probably immediate have snap1, snap2
    // we are trying build the diff incrementally? I might be wrong..or I might be right
    dealWithChildren(fiber);

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

/**
 * thoughts of commit
 * 
 * <div>
 *   <ol>
 *     <li></li>
 *     <li></li>
 *   </ol>
 *   <span></span>
 * </div>
 * 
 * 
 * 
 */
// use it to represent dom action
function OperationFiber(type) {
    this.type = type;
    this.child = this.parent = this.sibling = null;
}

function commitToDom(OperationFiber) {
    const { type } = OperationFiber;
    const dom = document.createElement(type);
    let next = OperationFiber.child;
    while (next) {
        const childDom = commitToDom(next);
        dom.appendChild(childDom);
        next = next.sibling; 
    }
    return dom;
}

const rootOperationFiber = new OperationFiber('div');
rootOperationFiber.child = new OperationFiber('ol');
rootOperationFiber.child.sibling = new OperationFiber('span');
rootOperationFiber.child.child = new OperationFiber('li');
rootOperationFiber.child.child.sibling = new OperationFiber('li');

const renderOperationFiber = (vdom, container) => {
    const newDom = commitToDom(rootOperationFiber);
    container.appendChild(newDom);
}

const React = {
    createElement,
}

const ReactDOM = {
    render: renderOperationFiber,
}
export {
    React,
    ReactDOM,
}