// import React from 'react';
// import ReactDOM from 'react-dom';

import { React, ReactDOM } from './MyReact';


function Hello() {
  return <div><a /></div>;
  // essentially it is function Hello() { return React.createElement('div', , React.createElement('a'))}
}

const element = <Hello />;

window.ele = element;
console.log(element);
// ReactDOM.render(
//   (
//     <div>
//       <ol>
//         <li></li>
//         <li></li>
//       </ol>
//       <span></span>
//     </div>
//   ),
//   document.getElementById('root')
// );

