import React from 'react';
import Jewel from './Jewel';
import '../css/animate.css';
import '../css/Board.css';

class Board extends React.Component {
  constructor(props) {
    super(props);
    const colors = [
      "rgb(0,0,225)","rgb(0,255,0)","rgb(255,0,0)",
      "rgb(0,255,225)", "rgb(255,0,225)", "rgb(255,255,0)"
    ];
    this.generateNewJewels = this.generateNewJewels.bind(this);
    this.getRandomColor = this.getRandomColor.bind(this);
    this.generateBoard = this.generateBoard.bind(this);
    this.handleClicked = this.handleClicked.bind(this);
    this.state = {
      colors: colors,
      board: this.generateBoard(colors),
    };
  }

  /**
   * handler to deal with clicks on the jewels
   * @param {Numer} id the css id for the clicked-on jewel-container div
   */
  handleClicked(id) {
    if(!this.props.inGame) { return; } // return if game is not in play
    const clicked = document.querySelector(".clicked"); // search for other jewel clicked
    const me = document.getElementById(id);
    // if another jewel has been clicked
    if(clicked) {

      // convert index into row,column
      let r1 = Math.floor(id/this.state.board.length);
      let c1 = id-(r1*this.state.board.length);
      let r2 = Math.floor(parseInt(clicked.id)/this.state.board.length);
      let c2 = parseInt(clicked.id)-(r2*this.state.board.length);

      // check if next to one another
      if(this.isNext(r1,c1,r2,c2)) {
        // switch the jewels and update game board
        let newBoard = this.switchJewels(r1,c1,r2,c2);
        this.updateBoard(newBoard);
      } else {
        me.classList.add("clicked");
      }
      clicked.classList.remove("clicked");
    } else {
      me.classList.add("clicked");
    }
  }

  /**
   * updates the board after a move
   * @param {String[][]} board the game board
   */
  updateBoard(board) {
    // for every jewel
    for(let i = 0; i < board.length; i++) {
      for(let j = 0; j < board[i].length; j++) {
        let obj = this.countJewels(board, i, j);

        // found 3 or more jewels in a row
        if(obj.leftRight.length >= 3 || obj.upDown.length >= 3) {
          let jewels = null;
          // choose the direction with the most jewels
          jewels = obj.leftRight.length > obj.upDown.length ? obj.leftRight : obj.upDown;

          // update the board
          this.setState({colors: this.state.colors, board: board}, () =>{
            let that = this; // for the last step, need to save 'this'
            this.getJewelElem(jewels, board)
              .then(this.fadeOut)
              .then(this.generateNewJewels)
              .then(this.addJewels)
              .then(function(obj) {
                that.props.updateScore(obj.nJewels);
                that.setState({colors: that.state.colors, board: obj.newBoard});
                that.updateBoard(that.state.board); // continue searching for more
              });
          });
          return;
        }
      }
    }
  }

  /**
   * First step into updating the game board, gets the respective jewel
   * html elements. Resolves an object of form => {elements:[], board: , jewels: }
   * @param {Object[{row: Number, col: Number}]} jewels an array of object containing the indices of which jewels need to be removed
   * @param {String[][]} board the game board right after player makes a move
   */
  getJewelElem(jewels, board) {
    return new Promise((resolve) => {
      let obj = {elements: [], board: board, jewels: jewels};
      for(let i = 0; i < jewels.length; i++) {
        const id = String(jewels[i].row*board.length+jewels[i].col);
        const jewel = document.getElementById(id).children[0];
        obj.elements.push(jewel);
      }
      resolve(obj);
    });
  }

  /**
   * source: http://youmightnotneedjquery.com/
   * Second step into updating the game board. Is passed an object of the form =>
   * {elements:[], board: , jewels: }. Will extract the elements array from the object 
   * and cause each html element to fade out. Resolves the same object except with out 
   * the elements array.
   * @param { Object {
   *  elements: HTMLElement[], 
   *  board: String[][], 
   *  jewels: Object[{row: Number, col: Number}] 
   *  }} obj The Passed object from the previous step 
   */
  fadeOut(obj) {
    return new Promise((resolve) => {
      let elements = obj.elements;
      elements.forEach(function(e) {
        e.style.opacity = 1;
      });
  
      var last = +new Date();
      var tick = function() {
        let date = +new Date();
        elements.forEach(function(e) {
          e.style.opacity = +e.style.opacity - (date - last) / 150;
        })
        last = +new Date();
  
        if (+elements[0].style.opacity > 0) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        } else if(+elements[0].style.opacity <= 0) {
          let nextObj = {board: obj.board, jewels: obj.jewels};
          resolve(nextObj);
        }
      };
  
      tick();
    });
  }

  /**
   * The third step in updating the game board. Passed the object resolved from step two
   * and will generate new Jewel colors. These colors will be placed in an array and 
   * added to the object to be passed onto the next step.
   * @param { Object {
   *  board: String[][], 
   *  jewels: Object[{row: Number, col: Number}],
   *  newJewels: String[]
   *  }} obj The Passed object from the previous step 
   */
  generateNewJewels(obj) {
    return new Promise((resolve) => {
      let newJewels = [];
      for(let i = 0; i < obj.jewels.length; i++) {
        newJewels.push(this.getRandomColor(this.state.colors));
      }
      obj.newJewels = newJewels;
      resolve(obj);
    });
  }

  /**
   * The fourth step in updating the game board. Passed the object the previous step
   * resolved and will add the newly created jewels to the board. Resolves and object
   * containing the new game board and the number of jewels destroyed.
   * @param { Object {
   *  board: String[][], 
   *  jewels: Object[{row: Number, col: Number}],
   *  newJewels: String[]
   *  }} obj The Passed object from the previous step  
   */
  addJewels(obj) {
    return new Promise((resolve) => {
      let newBoard = obj.board;
      let newJewels = obj.newJewels;
      let jewels = obj.jewels;

      function resetOpacity(row, col, len) {
        const id = String(row*len+col);
        const jewel = document.getElementById(id).children[0];
        jewel.style.opacity = 1;
      }

      // jewels are aligned vertically 
      if(jewels.every( (val, _, arr) => val.col === arr[0].col)){
        const col = jewels[0].col;

        // change the colors of the bottom jewels to be the ones above them
        for(let top = jewels[0].row-1, bot = jewels[jewels.length-1].row; top >= 0; top--, bot--) {
          newBoard[bot][col] = obj.board[top][col];
          resetOpacity(bot, col, obj.board.length);
        }

        // change the colors of the top jewels
        for(let i = 0; i < newJewels.length; i++) {
          newBoard[i][col] = newJewels[i];
          resetOpacity(i, col, obj.board.length);
        }
      } else { // jewels aligned horizontally 
        const row = jewels[0].row;

        // for every jewel part of the chain in the row
        for(let i = jewels[0].col; i <= jewels[jewels.length-1].col; i++) {
          // scoot the jewels above it down 
          for(let above = row; above > 0; above--) {
            newBoard[above][i] = obj.board[above-1][i];
          }
          resetOpacity(row, i, obj.board.length);
        }
        // change the colors of the top jewels
        for(let i = jewels[0].col, count = 0; i <= jewels[jewels.length-1].col; i++, count++) {
          newBoard[0][i] = newJewels[count];
          resetOpacity(row, i, obj.board.length);
        }
      }
      resolve({newBoard: newBoard, nJewels: newJewels.length});
    });
  }



  /**
   * Count the number of jewels in a row up/down and left/right from the jewel at (row,col).
   * @param {String[][]} board the game board
   * @param {Number} row which row to look from
   * @param {Number} col which column to look from
   * @returns an object with format => {upDown:[], leftRight:[]}, where the arrays will contain the indices of the jewels which are of the same color 
   */
  countJewels(board, row, col) {
    const obj = {upDown:[{row: row, col: col}], leftRight:[{row: row, col: col}]};
    for(let d = -1; d <= 1; d += 2) {
      // bounds check
      if(
        row+d < 0 || row+d > board.length ||
        col+d < 0 || col+d > board.length
      ) { continue; }
      
      // check up/down
      let yStep = 1;
      if(row+(d*yStep) >= 0 && row+(d*yStep) < board.length) {
        while(board[row][col] === board[row+(d*yStep)][col]) {
          obj.upDown.push({row: row+(d*yStep), col: col});
          yStep++;
          if(row+(d*yStep) < 0 || row+(d*yStep) >= board.length) {
            break;
          }
        }
    }

      // check left/right
      let xStep = 1;
      if(col+(d*xStep) >= 0 && col+(d*xStep) < board[row].length) {
        while(board[row][col] === board[row][col+(d*xStep)]) {
          obj.leftRight.push({row: row, col: col+(d*xStep)});
          xStep++;
          if(col+(d*xStep) < 0 || col+(d*xStep) > board[row].length) {
            break;
          }
        }
      }
    }

    return obj
  }

 /**
  * Determines if jewel at (r1,c1) is next to jewel at (r2,c2)
  * @param {Number} r1 row position for first jewel 
  * @param {Number} c1 column position for first jewel
  * @param {Number} r2 row position for second jewel
  * @param {Number} c2 column position for second jewel
  * @returns {boolean} true if jewels next to each other, false otherwise
  */
  isNext(r1,c1,r2,c2) {
    if(r1 === r2 && (c1+1 === c2 || c1-1 === c2)) {
      return true;
    } else if(c1 === c2 && (r1+1 === r2 || r1-1 === r2)) {
      return true;
    } else {
      return false;
    }
  }

  /**
  * Switches jewel at (r1,c1) with jewel at (r2,c2)
  * @param {Number} r1 row position for first jewel 
  * @param {Number} c1 column position for first jewel
  * @param {Number} r2 row position for second jewel
  * @param {Number} c2 column position for second jewel
  * @returns {String[][]} a new game board with the jewels switched
  */
  switchJewels(r1,c1,r2,c2) {
    let newBoard = this.copy(this.state.board);
    let tmp = newBoard[r1][c1];
    newBoard[r1][c1] = newBoard[r2][c2];
    newBoard[r2][c2] = tmp;
    return newBoard;
  }

  /**
   * source: https://www.codementor.io/avijitgupta/deep-copying-in-js-7x6q8vh5d
   * performs a deep copy of the passed object or array
   * @param {Object} o object which will be deep copied
   * @returns {Object} a deep copy of the object
   */
  copy(o) {
    let output, v, key;
    output = Array.isArray(o) ? [] : {};
    for(key in o) {
      v = o[key];
      output[key] = (typeof v === "object") ? this.copy(v) : v;
    }
    return output;
  }

  /**
   * Picks a random color
   * @param {String[]} colors the available colors to choose from
   * @returns {String} The rgb value for a random color in the form rgb(...)
   */
  getRandomColor(colors) {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  /**
   * Generates the next color for the jewel at (row,col).
   * This function ensures the color picked will not be
   * one to make three in a row. This should only be called
   * when the board is first loaded or when a new game is requested.
   * @param {String[][]} board game board
   * @param {String[]} colors available colors
   * @param {Number} row row position for jewel in question
   * @param {Number} col column position for jewel in question
   */
  generateNextColor(board, colors, row, col) {
    let color = this.getRandomColor(colors);
    let dup = { left: true, up: true };

    for(let i = -1; i >= -2; i--) {
      // check left
      if(col+i < 0) { 
        dup.left = false;
      } else if(color !== board[row][col+i]) {
        dup.left = false;
      }

      // check up
      if(row+i < 0) {
        dup.up = false;
      } else if(color !== board[row+i][col]) {
        dup.up =  false;
      }
    }

    // generate new random color so no longer 3 in a row
    if((dup.left && dup.up) || dup.up ) {
      while(color === board[row-1][col]) {
        color = this.getRandomColor(colors);
      }
    } else if(dup.left) {
      while(color === board[row][col-1]) {
        color = this.getRandomColor(colors);
      }
    }

    return color;
  }

  /**
   * Generates a game board when page first loaded or new game started.
   * @param {String[]} colors available colors to pick for jewels
   * @returns {String[][]} The game board and each jewels associated color
   */
  generateBoard(colors) {
    let board = new Array(9);
    for(let row = 0; row < board.length; row++) {
      board[row] = new Array(9);
      for(let col = 0; col < board[row].length; col++) {
        board[row][col] = this.generateNextColor(board, colors, row, col);
      }
    }
    return board;
  }

  /**
   * @returns An html element of the board for react to render
   */
  createHTMLBoard() {
    let board = [];

    // Outer loop to create parent
    for(let i = 0; i < 9; i++) {
      let children = []
      // Inner loop to create children
      for(let j = 0; j < 9; j++) {
        const iconColor = { color: this.state.board[i][j] }; // set the color of the jewel
        children.push(<Jewel index={(i*9)+j} color={iconColor} onclick={this.handleClicked}/>)
      }
      // Create the parent and add the children
      board.push(<div className="row">{children}</div>);
    }

    return board;
  }

  render() {
    return (
      <div id="board-container">
        <div id="board">
          {this.createHTMLBoard()}
        </div>
      </div>
    );
  }
}

export default Board