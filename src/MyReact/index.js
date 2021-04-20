

/**
 * 
 * @param {str|function} type 
 * @param {*} props 
 * @param  {...any} children 
 */
function createElement(type, props, ...children) {
    return {
        type,
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
 * maybe..we should store the dom action directly with the fiber? after all fiber ..is a storage for dom action?
 * 
 * [4] OperationFiber
 * so..what is the relationship between operation and fiber? and still..how the render/contaier.append( is triggered?
 * 
 * let's say we forget about the timing or operation, forget about requestIdlexx or setTimeout
 * let's say the getNext and contaier.append( will only be triggered manually by you, not the browser
 * basically, we dont want a work scheduling running, we schedule the work manually
 * 
 * and lets assume the fiber is the operationFiber itself, with "node" only available as operation info
 * 
 * [5] we probably want to keep a pointer to the current wip filber
 * when it is not null, worker should work on it, when it is none, time to commit
 * 
 * so perhaps, render, and setState..is just to assign value to it. wow!
 * 
 * let's think for a simpler case: we are just updating downwards: wip = currentFiber and then commitToDom from currentFiber
 * 
 * now the question is:...how the state is related to the fiber, how we know which dom is bound to a fiber? 
 * it seems the first is how to deal with functional component
 * 
 * wait I notice a problem, if fiber and react component/element is 1 to 1 mapping, unwrapping a function component to its dom structure 
 * will lose the "component" type in rendering phase 
 * https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree
 * https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react
 * 
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


const _rootFiber = {
    node: aN,
    child: null,
    sibling: null,
    parent: null,
}

// [2]
// only deal with first level of children
const dealWithChildren = (rootFiber, children) => {
    if (children.length !== 0) {
        // fiber generator
        const getChildFiberTemplate = (node) => {
            const newFiber = {
                parent: rootFiber, // known parent
                sibling: null,
                child: null,
                node, 
            };


            return newFiber;
        };

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
    console.log('fibering...', fiber.node.type);
    // we need to do sth before get to next
    // what do we want to do?
    // lets first try to build the next fiber while..traversing the tree
    // what is the tree? what is we are trying to build incrementally?
    // at this moment, tree is the vDom which we probably immediate have snap1, snap2
    // we are trying build the diff incrementally? I might be wrong..or I might be right

    // to deal with functional component which does not have children props by default..actually
    // actually it does not have vdom (the node), we need to calculate it
    if (fiber.node.type instanceof Function) {
        const children = fiber.node.type(fiber.node.props);
        fiber.node = children; // this is not good
        // function component is special
        fiber.hooks = [];
    } 

    dealWithChildren(fiber, fiber.node.props.children);


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
// function OperationFiber(type) {
//     this.type = type;
//     this.child = this.parent = this.sibling = null;
// }

/**
 * 
 * thoughts of state
 * we know..somehow when we call setState, we will get new react element, lets play a trick here
 * because we dont know how function component, fiber and state work together, we only know fiber..lets just put a setState in each fiber..
 * no..so stupid..yes..I want to be stupid
 */

function commitToDom(fiber) {
    if (!fiber.dom) {
        fiber.dom = document.createElement(fiber.node.type);
    }
    console.log('..doming', fiber.dom);

    let next = fiber.child;
    while (next) {
        const childDom = commitToDom(next);
        fiber.dom.appendChild(childDom);
        next = next.sibling; 
    }
    return fiber.dom;
}

// const rootOperationFiber = new OperationFiber('div');
// rootOperationFiber.child = new OperationFiber('ol');
// rootOperationFiber.child.sibling = new OperationFiber('span');
// rootOperationFiber.child.child = new OperationFiber('li');
// rootOperationFiber.child.child.sibling = new OperationFiber('li');

// const renderOperationFiber = (vdom, container) => {
//     const newDom = commitToDom(rootOperationFiber);
//     container.appendChild(newDom);
// }


const React = {
    createElement,
}


window.currRootFiber = null; // root (so far only 1 root fiber for commiting dom), it can also be updated..
window.wip = null; // curr

const ReactDOM = {
    render: (vdom, container) => {
        // two manual methods for you to play around
        const rootFiber = {
            node: vdom,
            child: null,
            sibling: null,
            parent: null,
        };
        window.rootFiber = rootFiber; 
        window.currRootFiber = rootFiber; // for commit to dom
        window.wip = rootFiber; // for iterating, so you can keep wip = getNext(wip);
        window.getNext = getNext;
        window.commitToDom = () => {
            // always commit from current root fiber
            container.appendChild(commitToDom(window.currRootFiber));
        }
    },
}
export {
    React,
    ReactDOM,
}