import React from 'react';
import '../css/App.css';
import Board from '../js/Board';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateScore = this.updateScore.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = { 
      score: 0,
      time: 100, 
      btnText: "Play", 
      inGame: false
    };
  }

  handleClick() {
    const btn = document.querySelector("button");
    btn.classList.remove("fade-in");
    btn.classList.add("fade-out");
    this.setState({
      score: 0,
      time: 100, 
      btnText: this.state.btnText, 
      inGame: true
    }, this.startTimer());
  }

  updateScore(nJewels) {
    this.setState({
      score: this.state.score + nJewels * 20,
      time: this.state.time,
      btnText: this.state.btnText, 
      inGame: this.state.inGame
    });
  }

  startTimer() {
    const that = this;
    let tick = function() {
      let time = that.state.time;
      if(time === 0) {
        that.setState({
          score: that.state.score, 
          time: 0, 
          btnText: "Play Again?", 
          inGame: false
        }, endTimer());
      } else {
        time = (time % 100) ? time - 1 : time - 41;
        that.setState({
          score: that.state.score,
          time: time, 
          btnText: "Play Again?",
          inGame: true
        });
      }
    }

    let endTimer = function() {
      const btn = document.querySelector("button");
      btn.classList.remove("fade-out");
      btn.classList.add("fade-in");
      clearInterval(t);
    }

    let t = setInterval(tick, 1000);
  }
  
  render() {
    return (
      <main>
        <Header time={this.state.time} 
                btnText={this.state.btnText} 
                handleClick={this.handleClick}
                score={this.state.score}/>
        <Board inGame={this.state.inGame}
               updateScore={this.updateScore}/>
      </main>
    );
  }
}


function Header(props) {
  return (
    <header>
      <Timer time={props.time}/>
      <PlayBtn btnText={props.btnText} handleClick={props.handleClick}/>
      <Score score={props.score}/>
    </header>
  );
}

function Timer(props) {
  const ones = props.time % 10;
  const tens = Math.floor(props.time / 10 % 10);
  const min = Math.floor(props.time / 100);

  return (
    <div id="timer-container">
      <p>Time left: 
        <span id="timer-min"> {min}</span>:
        <span id="timer-sec-tens">{tens}</span>
        <span id="timer-sec-ones">{ones}</span>
      </p>
    </div>
  );
}

function PlayBtn(props) {
  return (
    <div id="play-btn-container">
      <button onClick={() => props.handleClick()}>{props.btnText}</button>
    </div>
  )
}

function Score(props) {
  const ones = props.score % 10;
  const tens = Math.floor(props.score / 10 % 10);
  const hunds = Math.floor(props.score / 100 % 10);
  const thouds = Math.floor(props.score / 1000 % 10);
  const tenThouds = Math.floor(props.score / 10000 % 10);
  return (
    <div id="score-container">
      <p id="score">
        Score: 
        <span> {tenThouds}</span>
        <span>{thouds}</span>
        <span>{hunds}</span>
        <span>{tens}</span>
        <span>{ones}</span>  
      </p>
    </div>
  );
}

export default App;