(function() {
  'use strict';

  var canvas = document.getElementById('snakeBoard'),
    ctx = canvas.getContext('2d');
  
  // Properties (Constants and Variables)
  const SNAKE_LENGTH = 3,
    GRID_COLOR = '#222',
    BG_COLOR = '#101010',
    GRID_DIM = 20, // The width and height of each grid square
    SEPARATION = 10; // Separation between each square in the grid
    
  var pixels,
    width,
    height,
    pixelCounter = 0; // Used for giving a unique index to each of the pixels
    
  // Just for the sake of testing
  var litPixels = [0, 1, 2, 3, 4, 5];
    
  // Some variables concerned with just the snake and its movement
  var Pixel = {
    index: null,
    x: null,
    y: null,
    color: null,
    alpha: null,
    init({x = 0, y = 0, width = GRID_DIM, height = GRID_DIM, color = GRID_COLOR, alpha = 1} = 
    {x: 0, y: 0, width: GRID_DIM, height: GRID_DIM, color: GRID_COLOR, alpha: 1}) {
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
    
    var factor = GRID_DIM + SEPARATION;
    
    // Okay, let's try to figure out what the heck is going on in here
    for(var y = 0; y < height/factor; y++) {
			for(var x = 0; x < width/factor; x++) {
				pixels.push(Object.create(Pixel).init({x: x * factor, y: y * factor}));
			}
		}
  }
  
  function init() {
    populatePixels(); // Gets all the pixels initialized 
    // drawFirstFrame();
    requestAnimationFrame(drawFirstFrame);
    // requestAnimationFrame(nextFrame);
    document.getElementsByTagName('body')[0].setAttribute('bgcolor', BG_COLOR);
  }
  
  // The two below will have to share the same function to draw it 
  
  function drawFirstFrame() {
    var clp = litPixels;
    
    litPixels = litPixels.map(pIndex => pIndex + 1);
    
    console.log(litPixels);
    
    ctx.clearRect(0, 0, width, height);
    
    // The code below draw the whole initial grid
    for(var i = 0, l = pixels.length; i < l; i++) {
      // The grid has been drawn
      var cp = pixels[i]; // Current Pixel
      ctx.globalAlpha = 1;
      ctx.fillStyle = cp.color;
      ctx.fillRect(cp.x, cp.y, cp.width, cp.height);
      // Now draw the lit pixels
      if(clp && ~clp.indexOf(i)) {
        ctx.fillStyle = '#E49038';
        ctx.fillRect(cp.x, cp.y, cp.width, cp.height);
      }
    }
    
    requestAnimationFrame(debounce(drawFirstFrame, 100));
  }
  
  function nextFrame() {
    requestAnimationFrame(nextFrame);
  }
  
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