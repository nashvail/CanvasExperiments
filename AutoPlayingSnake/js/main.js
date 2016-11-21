(function () {
  'use strict';

  var canvas = document.getElementById('snakeBoard'),
    ctx = canvas.getContext('2d'),
    scoreContainer = document.getElementsByClassName('score')[0];

  // Modals 
  var modal = {
    init() {
      this.prim_button.addEventListener('click', this.handleClick);
    },
    show() {
      if (this.hidden) {
        this.elem.classList.remove('hidden');
        this.hidden = false;
      }
    },
    hide() {
      if (!this.hidden) {
        this.elem.classList.add('hidden');
        this.hidden = true;
      }
    },
    handleClick() {}
  };

  // Modal shown at the beginning of the game.
  var startModal = {
    elem: document.getElementById('modal_start'),
    prim_button: document.getElementById('btn_start'),
    hidden: false,
    init: modal.init,
    show: modal.show,
    hide: modal.hide,
    handleClick: startGame
  };

  // Modal shown when the game ends.
  var endModal = {
    elem: document.getElementById('modal_end'),
    prim_button: document.getElementById('btn_restart'),
    hidden: true,
    init: modal.init,
    show: modal.show,
    hide: modal.hide,
    handleClick: restartGame
  };

  startModal.init();
  endModal.init();



  // Represents a coordinate in the pixel space
  var Coord = {
    x: null,
    y: null,
    init(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      return this;
    },
    // Accepts another Coord parameter returns true if same, false otherwise
    equals(anotherCoord) {
      return this.x === anotherCoord.x && this.y === anotherCoord.y;
    },
    moveRight() {
      if (this.x + 1 === numCols)
        this.x = 0;
      else
        this.x = this.x + 1;
    },
    moveLeft() {
      if (this.x - 1 < 0)
        this.x = numCols - 1;
      else
        this.x = this.x - 1;
    },
    moveUp() {
      if (this.y - 1 < 0)
        this.y = numRows - 1;
      else
        this.y = this.y - 1;
    },
    moveDown() {
      if (this.y + 1 === numRows)
        this.y = 0;
      else
        this.y = this.y + 1;
    }
  };

  // Represents a pixel in the grid
  var Pixel = {
    index: null,
    coord: null,
    color: null,
    alpha: null,
    init({x = 0, y = 0, width = PIXEL_DIM, height = PIXEL_DIM, color = GRID_COLOR, alpha = 1} =
      { x: 0, y: 0, width: PIXEL_DIM, height: PIXEL_DIM, color: GRID_COLOR, alpha: 1 }) {
      this.coord = Object.create(Coord).init(x, y);
      this.width = width;
      this.height = height;
      this.color = color;
      this.alpha = alpha;

      return this;
    },
  };

  // Properties (Constants and Variables)
  var pixels,
    width,
    height,
    numRows,
    numCols;
  const GRID_COLOR = '#222', // Color of the squares that make up the grid
    BG_COLOR = '#101010',
    PIXEL_DIM = 20, // (Grid square dimension) The width and height of each grid square
    PIXEL_SEPARATION = 2, // PIXEL_SEPARATION between each square in the grid
    // This factor after taking in account the dimension of each pixel and the separation between them
    // helps in deciding the number of pixels in the grid when calculated later with window width and height
    FACTOR = PIXEL_DIM + PIXEL_SEPARATION;

  // For food
  var foodPixel;
  const FOOD_COLOR = '#FFF';

  // Animation Variables
  const FRAME_REFRESH_INTERVAL = 30, // (milliseconds) Smaller this value faster the snake moves
    SNAKE_SHORTEN_INTERVAL = 1500, // milliseconds
    SCORE_INCREMENT_INTERVAL = 300; // milliseconds

  var snakeLength,
    snakeHeadPosition,
    move;
  const SNAKE_COLOR = '#E49038',
    INITIAL_SNAKE_LENGTH = 6;

  // Stores the previous frame's position of the snake
  var prevSnakeCoords = [],
    debouncedNextFrame = debounce(nextFrame, FRAME_REFRESH_INTERVAL),
    reduceLengthTimeInterval,
    scoreTimeInterval,
    rafId,
    userIsPlaying = false,
    score = 0;

  // Functions 


  /**
   * Creates and stores pixels to be drawn on the 
   * canvas in an array. 
   */
  function populatePixels() {
    width = +canvas.getAttribute('width').split('px')[0];
    height = +canvas.getAttribute('height').split('px')[0];

    numRows = Math.floor(height / FACTOR);
    numCols = Math.floor(width / FACTOR);

    pixels = [];

    for (var row = 0; row < numRows; row++) {
      for (var col = 0; col < numCols; col++) {
        pixels.push(Object.create(Pixel).init({ x: col, y: row, color: GRID_COLOR }));
      }
    }
  }

  /**
   * First function that fires on page load (of course after the IIFE)
   */
  function init() {
    document.getElementsByTagName('body')[0].setAttribute('bgcolor', BG_COLOR);
  }

  /**
   * Begin playing the game 
   */
  function startGame() {
    if(!userIsPlaying) {
      userIsPlaying = true;
      // Hide Modal
      startModal.hide();
      // Draw Game
      populatePixels();
      initGameState();
      // Initialize score
      scoreContainer.classList.remove('flash');
      scoreContainer.innerHTML = '' + score;
      // Initialize timers
      reduceLengthTimeInterval = setInterval(decreaseSnakeLength, SNAKE_SHORTEN_INTERVAL);
      scoreTimeInterval = setInterval(incrementScore, SCORE_INCREMENT_INTERVAL);
      // Fire Animation
      rafId = requestAnimationFrame(nextFrame);
    }
  }

  /**
   * Shortens snake length by one 
   * every SNAKE_SHORTEN_INTERVAL seconds.
   */
  function decreaseSnakeLength() {
    snakeLength = snakeLength - 1;
    if (snakeLength <= 0) {
      gameOver();
    }
  }

  /**
   * Increments player score every
   * SCORE_INCREMENT_INTERVAL seconds.
   */
  function incrementScore() {
    score++;
    scoreContainer.innerHTML = '' + score;
  }

  /**
   * When length of the snake hits 0
   * the following function is fired.
   */
  function gameOver() {
    if(userIsPlaying) {
      userIsPlaying = false;
      // Stop timers
      clearInterval(reduceLengthTimeInterval);
      clearInterval(scoreTimeInterval);
      // Reset Score
      score = 0;
      scoreContainer.classList.add('flash');
      // Show end modal
      endModal.show();
      // Stop Animation
      cancelAnimationFrame(rafId);
    }
  }

  // Restarts the game, 
  // Fired when 'Play again' button is clicked.
  function restartGame() {
    if(!userIsPlaying) {
      endModal.hide();
      startGame();
    }
  }

  /**
   * Initializes the state of game.
   */
  function initGameState() {
    prevSnakeCoords = [];
    snakeLength = INITIAL_SNAKE_LENGTH;
    foodPixel = randomPixelOnGrid();
    snakeHeadPosition = randomPixelOnGrid().coord;
    move = Coord.moveRight;
  }

  /**
   * The game animates by showing multiple individual frames per second,
   * the following function sets up each frame.
   */
  function nextFrame() {
    ctx.clearRect(0, 0, width, height);

    // An array of Coords holding coordinates of each grid cell that makes up the snake
    var snakeCoords = isFirstAnimationFrame() ?
      initialSnakePosition(snakeHeadPosition, snakeLength) :
      newSnakePosition(Object.create(Coord).init(snakeHeadPosition.x, snakeHeadPosition.y));

    for (var i = 0; i < pixels.length; i++) {
      var cp = pixels[i]; // Current Pixel

      drawPixel(cp, GRID_COLOR);
      if (isASnakePixel(cp, snakeCoords)) {
        drawPixel(cp, SNAKE_COLOR);
        if (isFoodPixel(cp)) { // If food and snake pixel coincide that means the snake ate the food
          snakeLength++;
          foodPixel = randomPixelOnGrid();
        }
      }
      if (isFoodPixel(cp))
        drawPixel(cp, FOOD_COLOR);
    }

    prevSnakeCoords = snakeCoords;
    move.call(snakeHeadPosition);
    requestAnimationFrame(debouncedNextFrame);
  }

  /**
   * Draws a single pixel on the gird.
   * 
   * @param {Object} pixel - Pixel to be drawn.
   * @param {String} color - Color of the pixel.
   */
  function drawPixel(pixel, color) {
    ctx.fillStyle = color;
    ctx.fillRect(pixel.coord.x * FACTOR, pixel.coord.y * FACTOR, pixel.width, pixel.height);
  }

  /**
   * Returns a random pixel on the grid.
   * @returns {object} - a Pixel Object
   */
  function randomPixelOnGrid() {
    return Object.create(Pixel).init({
      x: Math.floor(Math.random() * numCols),
      y: Math.floor(Math.random() * numRows),
      color: FOOD_COLOR
    });
  }

  /**
   * On the Pixel if grid checks if a pixel is a food pixel.
 
   * @param {Object} pixel - Should be a Pixel Object
   * @returns {Boolean}
   */
  function isFoodPixel(pixel) {
    return pixel.coord.equals(foodPixel.coord);
  }

  /**
   * Checks if the current frame is the first animation frame, 
   * since there is setup to be done in the first animation frame.
   * 
   * @returns {Boolean}
   */
  function isFirstAnimationFrame() {
    return prevSnakeCoords.length === 0; // In the beginning there is no previous snake position.
  }

  // Snake Functions

  /**
   * Returns an array of Coord objects each holding coordinates
   * of grid pixels to be lit up.
   * 
   * @param {Object} snakeHeadPosition - A Coord Object
   * @returns {Array}
   */
  function newSnakePosition(snakeHeadPosition) {
    var changeInLength = snakeLength - prevSnakeCoords.length;
    var newPosition = prevSnakeCoords.slice(1);
    newPosition.push(snakeHeadPosition);

    var lastSnakeCoord = newPosition[0],
      secondLastSnakeCoord = newPosition[1];

    if (prevSnakeCoords.length === 1 && changeInLength > 0) {
      if (move === Coord.moveUp) {
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x, lastSnakeCoord.y + i + 1)));
      } else if (move === Coord.moveRight) {
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x - i - 1, lastSnakeCoord.y)));
      } else if (move === Coord.moveDown) {
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x, lastSnakeCoord.y - i - 1)));
      } else if (move === Coord.moveLeft) {
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x + i + 1, lastSnakeCoord.y)));
      }
    } else if (prevSnakeCoords.length > 1 && changeInLength > 0) {
      var deltaX = secondLastSnakeCoord.x - lastSnakeCoord.x,
        deltaY = secondLastSnakeCoord.y - lastSnakeCoord.y;

      if (deltaY < 0) { // Moving up
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x, lastSnakeCoord.y + i + 1)));
      } else if (deltaY > 0) { // Moving down
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x, lastSnakeCoord.y - i - 1)));
      } else if (deltaX < 0) { // Moving right
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x - i - 1, lastSnakeCoord.y)));
      } else if (deltaX > 0) { // Moving left
        range(changeInLength)
          .forEach((_, i) => newPosition.unshift(Object.create(Coord).init(lastSnakeCoord.x + i + 1, lastSnakeCoord.y)));
      }
    } else if (changeInLength < 0) {
      newPosition.shift();
    }
    return newPosition;
  }

  /**
   * Checks if passed in pixel is part of snake and should 
   * be lit up or not.
   * 
   * @param {Object} pixel
   * @param {Array} snake
   * @returns {Boolean} - If pixel is part of the snake or not.
   */
  function isASnakePixel(pixel, snake) {
    return snake.some(snakePixel => snakePixel.x === pixel.coord.x && snakePixel.y === pixel.coord.y);
  }

  /**
   * Based on snakeLength and snakeHeadPosition returns an array of Coords that 
   * represent the initial positions of snake pixels on the grid.
   * 
   * @param {Object} headPosition - A Coord Object representing the head of the snake.
   * @param {Number} snakeLength
   * @returns {Array} An array of Coords that represent the full snake.
   */
  function initialSnakePosition(headPosition, snakeLength) {
    var startPos = headPosition.x - snakeLength + 1;
    var initialPos = range(snakeLength).map(_ => {
      return Object.create(Coord).init(startPos++, headPosition.y);
    });
    return initialPos;
  }

  function snakeIsMovingVertically() {
    return move === Coord.moveUp || move === Coord.moveDown;
  }

  function snakeIsMovingHorizontally() {
    return move === Coord.moveRight || move === Coord.moveLeft;
  }

  // Utility function 

  // Returns an array of integer based on the passed in parameters
  function range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = new Array(length);

    for (var idx = 0; idx < length; idx++ , start += step) {
      range[idx] = start;
    }

    return range;
  }

  /**
   * Returns debounced version of the passed in func. 
   * 
   * @param {Function} func - Function to be debounced
   * @param {Number} wait - Amount of seconds to wait
   * @param {Boolean} immediate - Should fire on leading or trailing end of wait
   * @returns
   */
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // Code execution starts from below here
  init();

  // Event listeners

  window.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
      case 37: // Left
        if (snakeIsMovingVertically())
          move = Coord.moveLeft;
        event.preventDefault();
        break;
      case 38: // Up
        if (snakeIsMovingHorizontally())
          move = Coord.moveUp;
        event.preventDefault();
        break;
      case 39: // Right
        if (snakeIsMovingVertically())
          move = Coord.moveRight;
        event.preventDefault();
        break;
      case 40: // Down
        if (snakeIsMovingHorizontally())
          move = Coord.moveDown;
        event.preventDefault();
        break;
      default:
        // Ignore
        break;
    };
  });

})();