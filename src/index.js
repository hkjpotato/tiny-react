import React from 'react';
import ReactDOM from 'react-dom';

// import { React, ReactDOM } from './MyReact';

function List(props) {
  const [state, setState] = React.useState(2);
  const [isA, setIsA] = React.useState(true);

  const children = new Array(state).fill(0).map((i, index) => <li key={index}>{isA ? <a></a> : <p></p>}</li>)
  // expose to window, let window event trigger state change
  // window.triggerSetState = () => {
  //   setState(state * 2);
  //   setIsA(!isA);
  // };
  console.log('kj: useState results', state, isA);
  return (
    <ol onClick={() => {
      setState(state * 2);
      setIsA(!isA);
    }}>
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

