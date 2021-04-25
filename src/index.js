// import React from 'react';
// import ReactDOM from 'react-dom';

import { React, ReactDOM } from './MyReact';

function List(props) {
  const [state, setState] = React.useState(2);
  const children = new Array(state).fill(0).map(i => <li key={i}></li>)
  // expose to window, let window event trigger state change
  window.triggerSetState = () => setState(state * 2);

  return (
    <ol>
      {children}
    </ol>
  );
  // essentially it is function Hello() { return React.createElement('div', , React.createElement('a'))}
}


ReactDOM.render(
  (
    <div>
      <List />
      <span></span>
    </div>
  ),
  document.getElementById('root')
);

