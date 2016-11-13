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
    PIXEL_SEPARATION = 5, // PIXEL_SEPARATION between each square in the grid
    // This factor after taking in account the dimension of each pixel and the separation between them
    // helps in deciding the number of pixels in the grid when calculated later with window width and height
    FACTOR = PIXEL_DIM + PIXEL_SEPARATION;
    
  var pixels, // This needs to be a two dimensional array alright? 
    width,
    height,
    numRows,
    numCols,
    snakeLength = 8,
    snakeHeadPosition = Object.create(Coord).init(20, 10);
   
   // Stores the previous frame's position of the snake
   var prevSnakePosition = [];
   var debouncedNextFrame = debounce(nextFrame, 100);

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
				pixels.push(Object.create(Pixel).init({x: col, y: row}));
			}
		}
  }
  
  function init() {
    document.getElementsByTagName('body')[0].setAttribute('bgcolor', BG_COLOR); 
    populatePixels();
    requestAnimationFrame(nextFrame);
  }

  // The two below will have to share the same function to draw it 
  
  function nextFrame() {
    ctx.clearRect(0, 0, width, height); 

    // An array of Coords holding coordinates of each grid cell that makes up the snake
    var snakePosition = isFirstAnimationFrame() ? 
      initialSnakePosition(snakeHeadPosition, snakeLength) : 
      newSnakePosition(Object.assign({}, snakeHeadPosition));

    for(var i = 0; i < pixels.length; i++) {
      var cp = pixels[i]; // Current Pixel
      ctx.globalAlpha = cp.alpha;
      ctx.fillStyle = cp.color;
      ctx.fillRect(cp.coord.x * FACTOR, cp.coord.y * FACTOR, cp.width, cp.height);

      if(isASnakePixel(cp, snakePosition)) { // If the pixel is part of snake it should light up
        ctx.fillStyle = SNAKE_COLOR;
        ctx.fillRect(cp.coord.x * FACTOR, cp.coord.y * FACTOR, cp.width, cp.height);
      }

    }

    prevSnakePosition = snakePosition;
    snakeHeadPosition.moveLeft();
    requestAnimationFrame(debouncedNextFrame);
  }

  function newSnakePosition(snakeHeadPosition) {
    var newPosition = [];
    newPosition = newPosition.concat(prevSnakePosition.slice(1));
    newPosition.push(snakeHeadPosition);
    return newPosition;
  }

  function isFirstAnimationFrame() {
    return prevSnakePosition.length === 0; // In the beginning there is no previous snake position.
  }

  function isASnakePixel(pixel, snake) {
    return snake.some(snakePixel => snakePixel.x === pixel.coord.x && snakePixel.y === pixel.coord.y);
  }
  
  function initialSnakePosition(headPosition, snakeLength) {
    var startPos = headPosition.x - snakeLength + 1;
    return range(snakeLength).map( _ => {
      return Object.create(Coord).init(startPos++, headPosition.y);
    });
  }
 
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

  // Debounces the function (func) passed into it
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

})();