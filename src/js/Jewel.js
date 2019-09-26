import React from 'react';
import '../css/Jewel.css';

function Jewel(props) {
  return (
    <div className="jewel-container" id={props.index}>
      <i style={props.color} className="fas fa-gem" onClick = {() => props.onclick(props.index)}></i>
    </div>
  );
}

export default Jewel;