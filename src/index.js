// import React from 'react';
// import ReactDOM from 'react-dom';

import { React, ReactDOM } from './MyReact';


function List(props) {
  return (
    <ol>
      <li></li>
      <li></li>
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

