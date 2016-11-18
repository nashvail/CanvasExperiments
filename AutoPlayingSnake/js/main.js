(function() {
  'use strict';

  var canvas = document.getElementById('snakeBoard'),
    ctx = canvas.getContext('2d');
      
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
      this.x = (++this.x) % numCols;
    },
    moveLeft() {
      this.x--;
      if(this.x < 0)
        this.x = numCols;
    },
    moveUp() {
      this.y--;
      if(this.y < 0)
        this.y = numRows + 1;
    },
    moveDown() {
      this.y = (++this.y) % numRows;
    }
  };
  
  // Represents a pixel in the grid
 var Pixel = {
    index: null,
    coord: null,
    color: null,
    alpha: null,
    init({x = 0, y = 0, width = PIXEL_DIM, height = PIXEL_DIM, color = GRID_COLOR, alpha = 1} = 
    {x: 0, y: 0, width: PIXEL_DIM, height: PIXEL_DIM, color: GRID_COLOR, alpha: 1}) {
      this.coord = Object.create(Coord).init(x, y);
      this.width = width;
      this.height = height;
      this.color = color;
      this.alpha = alpha;

      return this; 
    },
  };

  // Properties (Constants and Variables)
  const SNAKE_COLOR = '#E49038',
    GRID_COLOR = '#222', // Color of the squares that make up the grid
    BG_COLOR = '#101010',
    PIXEL_DIM = 20, // (Grid square dimension) The width and height of each grid square
    PIXEL_SEPARATION = 2, // PIXEL_SEPARATION between each square in the grid
    // This factor after taking in account the dimension of each pixel and the separation between them
    // helps in deciding the number of pixels in the grid when calculated later with window width and height
    FACTOR = PIXEL_DIM + PIXEL_SEPARATION;

   // For food
   var foodPixel,
    FOOD_COLOR = '#FFF';
    
  var pixels, // This needs to be a two dimensional array alright? 
    width,
    height,
    numRows,
    numCols,
    snakeLength = 5,
    snakeHeadPosition = Object.create(Coord).init(20, 10),
    move = Coord.moveRight;
   
   // Stores the previous frame's position of the snake
   var prevSnakePosition = [];
   var debouncedNextFrame = debounce(nextFrame, 50);

  // Functions 
  function populatePixels() {
    width = window.innerWidth;
    height = window.innerHeight;
    numRows = Math.ceil(height / FACTOR);
    numCols = Math.ceil(width / FACTOR);

    canvas.width = width;
    canvas.height = height;

    pixels = [];

    for(var row = 0; row < numRows; row++) {
      for(var col = 0; col < numCols; col++) {
        pixels.push(Object.create(Pixel).init({x: col, y: row, color: GRID_COLOR}));
			}
		}
  }
  
  function init() {
    document.getElementsByTagName('body')[0].setAttribute('bgcolor', BG_COLOR); 
    populatePixels();
    foodPixel = randomPixelOnGrid();
    requestAnimationFrame(nextFrame);
  }

  function nextFrame() {
    ctx.clearRect(0, 0, width, height); 

    // An array of Coords holding coordinates of each grid cell that makes up the snake
    var snakePosition = isFirstAnimationFrame() ? 
      initialSnakePosition(snakeHeadPosition, snakeLength) : 
      newSnakePosition(Object.assign({}, snakeHeadPosition));

    for(var i = 0; i < pixels.length; i++) {
      var cp = pixels[i]; // Current Pixel

      drawPixel(cp, GRID_COLOR);
      if(isASnakePixel(cp, snakePosition)) {
        drawPixel(cp, SNAKE_COLOR);

        if(isFoodPixel(cp)) { // If food and snake pixel coincide that means the snake ate the food
          snakeLength++;
          foodPixel = randomPixelOnGrid();
        }
      }

      if(isFoodPixel(cp)) 
        drawPixel(cp, FOOD_COLOR);

    }
    prevSnakePosition = snakePosition;
    move.call(snakeHeadPosition);
    requestAnimationFrame(debouncedNextFrame);
  }

  function snakeAteFood() {

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
    return prevSnakePosition.length === 0; // In the beginning there is no previous snake position.
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
    var changeInLength = snakeLength - prevSnakePosition.length;
    var newPosition = [].concat(prevSnakePosition.slice(1));
    newPosition.push(snakeHeadPosition);

    if(changeInLength > 0) { 
      var deltaX = newPosition[1].x - newPosition[0].x;
      var deltaY = newPosition[1].y - newPosition[0].y;

      if(deltaY < 0) { // Moving up
        range(changeInLength)
          .forEach( (_, i) => newPosition.unshift(Object.create(Coord).init(newPosition[0].x ,newPosition[0].y + i +1)));
      } else if(deltaY > 0) { // Moving down
        range(changeInLength)
          .forEach( (_, i) => newPosition.unshift(Object.create(Coord).init(newPosition[0].x ,newPosition[0].y - i - 1)));
      } else if(deltaX < 0) { // Moving right
        range(changeInLength)
          .forEach( (_, i) => newPosition.unshift(Object.create(Coord).init(newPosition[0].x - i - 1 ,newPosition[0].y)));
      } else if(deltaX > 0) { // Moving left
        range(changeInLength)
          .forEach( (_, i) => newPosition.unshift(Object.create(Coord).init(newPosition[0].x + i + 1 ,newPosition[0].y)));
      }
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
    return range(snakeLength).map( _ => {
      return Object.create(Coord).init(startPos++, headPosition.y);
    });
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

    for (var idx = 0; idx < length; idx++, start += step) {
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
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if(!immediate) func.apply(context, args);
      };
      
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if(callNow) func.apply(context, args);
    };
  }
  
  // Code execution starts from below here
  init();

  // Event listeners

  window.addEventListener('resize', debounce(init, 150));

  window.addEventListener('keydown', (event) => {
    switch(event.keyCode) {
      case 37: // Left
        if(snakeIsMovingVertically())
          move = Coord.moveLeft;
        event.preventDefault();
      break;
      case 38: // Up
        if(snakeIsMovingHorizontally())
          move = Coord.moveUp;
        event.preventDefault();
      break;
      case 39: // Right
        if(snakeIsMovingVertically())
          move = Coord.moveRight;
        event.preventDefault();
      break;
      case 40: // Down
        if(snakeIsMovingHorizontally())
          move = Coord.moveDown;
        event.preventDefault();
      break;
      default: 
        // Ignore
      break;
    };
  });

})();