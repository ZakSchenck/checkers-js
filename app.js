let isDarkPieceTurn = true;
const darkPieces = document.querySelectorAll(".dark-piece");
const lightPieces = document.querySelectorAll(".light-piece");
const allSquares = document.querySelectorAll(".square");

// Variables storing the values for which indexes on each piece can be played
const diagonalUpLeftIndexNum = 7;
const diagonalUpRightIndexNum = 9;
const diagonalDownLeftIndexNum = -7;
const diagonalDownRightIndexNum = -9;

// Gets indexes of squares unable to be played
const falseIndexes = [0, 16, 32, 48, 15, 31, 47, 63];

let pieceNum = null;
let squareIndex;
let currentPiece = null;

/**
 * Conditionally sets hover effect based on whose turn it is
 * @param {HTMLDivElement} piece
 */
const conditionalPieceHover = (piece) => {
  piece.forEach((checker) => {
    // Add cursor pointer style on hover
    checker.addEventListener("mouseenter", () => {
      checker.style.cursor = "pointer";
    });

    // Remove cursor style when not hovering
    checker.addEventListener("mouseleave", () => {
      checker.style.cursor = "default";
    });
  });
};

// Immediately invoke the function when loading page
conditionalPieceHover(darkPieces);

/**
 * Handler for each piece click event. Conditional turns are present in the gameBoard event listener
 * @param {Event} event
 * @param {HTMLDivElement} piece
 * @param {String} textForTurn
 * @param {String} pieceClass
 */
const gameBoardClickEventHandler = (event, piece, textForTurn, pieceClass) => {
  const turnText = document.getElementById("turn-text");

  // Sets hover on checker pieces for whose turn it is
  conditionalPieceHover(piece);

  // Change game state turn text
  turnText.innerText = textForTurn;

  // Check if the clicked element is a dark piece
  if (event.target.classList.contains(pieceClass)) {
    // Set each to the default color unless clicked again
    darkPieces.forEach((darkPiece) => {
      darkPiece.style.backgroundColor = null;
    });

    const currentPiece = event.target;
    currentPiece.style.backgroundColor = "lightgreen";

    // Calculate available squares based on the clicked piece
    checkAvailableSquares(currentPiece);
  }
};
/** Click event delegation for each dark piece
 * @param {event} event
 */
document.querySelector('.game-board').addEventListener("click", (event) =>
  // Runs gameBoardClickEventHandler with certain attributes based on a condition (whose turn it is)
  isDarkPieceTurn
    ? gameBoardClickEventHandler(
      event,
      darkPieces,
      "Black Piece's Turn",
      "dark-piece"
    )
    : gameBoardClickEventHandler(
      event,
      lightPieces,
      "White Piece's Turn",
      "light-piece"
    )
);

/**
 * Removes checker you hop over
 * @param {Number} num 
 * @param {String} piece 
 */
const eliminateCheckerConditional = (num, piece) => {
  if (allSquares[squareIndex - num]?.childNodes[0]?.classList.contains(piece)) {
    allSquares[squareIndex - num]?.childNodes[0]?.remove();
  }
}

// Calculates the score for each side, then displays it on the screen.
const calculateAndDisplayScore = () => {
  const removedLightPiecesEl = document.getElementById("removed-light-pieces");
  const removedDarkPiecesEl = document.getElementById("removed-dark-pieces");

  let removedLightPiecesNum = 0;
  let removedDarkPiecesNum = 0;

  if (isDarkPieceTurn) {
    removedLightPiecesNum++;
    removedLightPiecesEl.innerText = removedLightPiecesNum;
  } else {
    removedDarkPiecesNum++;
    removedDarkPiecesEl.innerText = removedDarkPiecesNum;
  }
}

/**
 * Checks where you put your checker, then removes checker you hop over
 * @param {Boolean} isDarkTurn 
 * @param {Number} num 
 * @param {String} pieceType 
 */
const isPieceDiagRightOrLeft = (isDarkTurn, num, pieceType, e) => {
  if (isDarkTurn && pieceNum === num && e.target === allSquares[squareIndex - pieceNum * 2]) {
    eliminateCheckerConditional(num, pieceType);
    calculateAndDisplayScore();
  }
}

/** 
 * If dark piece's turn, make checker black. Else, turn it white. This is for adding new checkers
 * @param {HTMLDivElement} square - Div element of the current piece that is moving 
 */
const changeCheckerColor = (square) => {
  // Move piece to desired space
  const pieceMove = document.createElement("div");
  isDarkPieceTurn
    ? pieceMove.classList.add("dark-piece")
    : pieceMove.classList.add("light-piece");
  square.appendChild(pieceMove);
}

/**
 * When a checker is moved, we remove its original place from the DOM
 * @param {HTMLDivElement} square - Div element of the current piece that is moving
 */
removeMovedChecker = (square) => {
  // Remove old element
  currentPiece.remove();
  allSquares.forEach((square) => {
    square.style.backgroundColor = null;
  });
}

/** Remove pieces from the DOM and add new ones
 * @param {HTMLDivElement} square
 * @param {Number} index
 */
allSquares.forEach((square, index) => {
  square.addEventListener("click", (e) => {
    if (!square) {
      console.error("Error: Clicked square does not exist on the board");
      return;
    }
    if (square.style.backgroundColor === "green") {
      isPieceDiagRightOrLeft(isDarkPieceTurn, diagonalUpLeftIndexNum, "light-piece", e);
      isPieceDiagRightOrLeft(isDarkPieceTurn, diagonalUpRightIndexNum, "light-piece", e);
      isPieceDiagRightOrLeft(!isDarkPieceTurn, diagonalDownRightIndexNum, "dark-piece", e);
      isPieceDiagRightOrLeft(!isDarkPieceTurn, diagonalDownLeftIndexNum, "dark-piece", e);

      changeCheckerColor(square);
      removeMovedChecker(square);

      // Change turns to opposite piece
      isDarkPieceTurn = !isDarkPieceTurn;
    }

    console.log(index);
  });
});

/**
 * Checks Diagonal spaces to the left and right if they are open. If so, make the space green and clickable
 * @param {Number} squareIndex
 * @param {Number} diag
 */
const checkDiagonalSpaces = (squareIndex, diag) => {
  // Throws error if square does not exist
  if (!allSquares[squareIndex - diag]) {
    console.error("Error: Certain square does not exist to be played");
  }
  if (
    !allSquares[squareIndex - diag].hasChildNodes() &&
    !falseIndexes.includes(squareIndex - diag)
  ) {
    pieceNum = diag;
    allSquares[squareIndex - diag].style.backgroundColor = "green";
  }
};

/**
 * Checks Diagonal spaces that can take the enemy player. If so make the space green and clickable
 * @param {Number} squareIndex
 * @param {Number} diag
 * @param {String} pieceType
 */
const checkSkipDiagonalSpaces = (squareIndex, diag, pieceType) => {
  // Throws error if square does not exist
  if (!allSquares[squareIndex - diag * 2]) {
    console.error("Error: Certain square does not exist to be played");
  }
  console.log(pieceType)
  if (
    !allSquares[squareIndex - diag * 2].hasChildNodes() &&
    // Checks if the piece type to take is the opponent's piece
    allSquares[squareIndex - diag]?.childNodes[0]?.classList.contains(pieceType) &&
    !falseIndexes.includes(squareIndex - diag * 2)
  ) {
    pieceNum = diag;
    allSquares[squareIndex - diag * 2].style.backgroundColor = "green";
  }
};

/**
 * If the piece you can skip over is an enemy piece, then make that square green.
 * @param {number} rightDiag // Spaces to right diagonal possible move
 * @param {number} leftDiag // Spaces to left diagonal possible move 
*/
const checkIfSkipOverIsAvailable = (rightDiag, leftDiag) => {
  // Checks diagonal spaces with a condition where the opponent's light piece can be taken
  if (isDarkPieceTurn) {
    checkSkipDiagonalSpaces(squareIndex, leftDiag, "light-piece");
    checkSkipDiagonalSpaces(squareIndex, rightDiag, "light-piece");
  } else {
    // Checks diagonal spaces with a condition where the opponent's dark piece can be taken
    checkSkipDiagonalSpaces(squareIndex, leftDiag, "dark-piece");
    checkSkipDiagonalSpaces(squareIndex, rightDiag, "dark-piece");
  }
}

/**
 * If statements checking if square is being used or if square is not available
 * @param {HTMLDivElement} piece
 * @param {number} rightDiag // Spaces to right diagonal possible move
 * @param {number} leftDiag // Spaces to left diagonal possible move
 */
const calculateAvailableSquares = (piece, rightDiag, leftDiag) => {
  // Gets index of current square
  squareIndex = Array.from(allSquares).indexOf(piece.parentNode);

  if (!squareIndex) {
    console.error("Error: This clicked square does not exist in the system.");
    return;
  }

  // Checks diagonal spaces for each side
  checkDiagonalSpaces(squareIndex, rightDiag);
  checkDiagonalSpaces(squareIndex, leftDiag);

  checkIfSkipOverIsAvailable(rightDiag, leftDiag);
};

// Change background color of previous green squares to null when clicked off of
const removeClickOffBackgroundColor = () => {
  allSquares.forEach((square) => {
    square.style.backgroundColor = null;
  });
}

/**
 * Calculate which clicked on pieces can move to certain spaces
 * @param {HTMLDivElement} piece
 * @returns {function}
 */
const checkAvailableSquares = (piece) => {
  removeClickOffBackgroundColor();

  currentPiece = piece;

  // If it is dark piece's turn. return which squares turn green. Else is handled for light piece's turn
  if (isDarkPieceTurn) {
    return calculateAvailableSquares(
      piece,
      diagonalUpRightIndexNum,
      diagonalUpLeftIndexNum
    );
  }
  return calculateAvailableSquares(
    piece,
    diagonalDownRightIndexNum,
    diagonalDownLeftIndexNum
  );
};
