(function() {
  'use strict';

  var canvas = document.getElementById('snakeBoard'),
    ctx = canvas.getContext('2d');
  
  // Properties (Constants and Variables)
  const SNAKE_LENGTH = 3,
    GRID_COLOR = '#222',
    BG_COLOR = '#101010',
    GRID_DIAM = 8, // The width and height of each grid square
    DENSITY_FACTOR = 10;
    
  var pixels,
    width,
    height,
    pixelCounter = 0; // Gives a unique index to each of the pixels
    
  // Some variables concerned with just the snake and its movement
  var Pixel = {
    index: null,
    x: null,
    y: null,
    color: null,
    alpha: null,
    init({x = 0, y = 0, width = GRID_DIAM, height = GRID_DIAM, color = GRID_COLOR, alpha = 1} = 
    {x: 0, y: 0, width: GRID_DIAM, height: GRID_DIAM, color: GRID_COLOR, alpha: 1}) {
      this.index = pixelCounter++;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.alpha = alpha;

      return this; 
    }
  };
  
  // Functions 
  
  function populatePixels() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    pixels = [];
    
    for(var y = 0; y < height/DENSITY_FACTOR; y++) {
			for(var x = 0; x < width/DENSITY_FACTOR; x++) {
				pixels.push(Object.create(Pixel).init({x: x * DENSITY_FACTOR, y: y * DENSITY_FACTOR}));
			}
		}
  }
  
  function init() {
    populatePixels(); // Gets all the pixels initialized 
    drawFirstFrame();
    // requestAnimationFrame(nextFrame);
    document.getElementsByTagName('body')[0].setAttribute('bgcolor', BG_COLOR);
  }
  
  // The two below will have to share the same function to draw it 
  
  function drawFirstFrame() {
    ctx.clearRect(0, 0, width, height);
    
    // The code below draw the whole initial grid
    for(var i = 0, l = pixels.length; i < l; i++) {
      var cp = pixels[i]; // Current Pixel
      ctx.globalAlpha = 1;
      ctx.fillStyle = cp.color;
      ctx.fillRect(cp.x, cp.y, cp.width, cp.height);
    }
  }
  
  function nextFrame() {
    requestAnimationFrame(nextFrame);
  }
  
  // Code execution starts from below here
  init();

})();