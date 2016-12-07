'use strict';

Object.prototype.extend = function (extension) {
  var object = Object.create(this);
  for (var property in extension) {
    if (extension.hasOwnProperty(property) || object[property] === 'undefined') { // There should be && instead of || right? IDK LOL
      object[property] = extension[property];
    }
  }
  return object;
};

var height = window.innerHeight,
  width = window.innerWidth;

var canvas = document.getElementById('demo-canvas');
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, width, height);

class Circle {
  constructor({cx = 0, cy = 0, radius = 20, sA = 0, eA = 2 * Math.PI, filled = true, color = '#FF0000', strokeWidth = 3}
    = { cx: 0, cy: 0, radius: 20, sA: 0, eA: 2 * Math.PI, filled: true, color: '#FF0000', strokeWidth: 3 }) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.sA = sA;
    this.eA = eA;
    this.filled = filled;
    this.color = color;
    this.strokeWidth = strokeWidth;
  }

  draw() {
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius, this.sA, this.eA, false);
    if (this.filled) { // Draw a solid circle
      ctx.fillStyle = this.color;
      ctx.fill();
    } else { // Draw a stroked circle
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();

    }
  }
}

class SolidCircle extends Circle {
  constructor(config) {
    super(config.extend({ filled: true }));
  }
}

class StrokeCircle extends Circle {
  constructor(config) {
    super(config.extend({ filled: false }));
  }
}

// Create two circles, red stroked small over green solid large
var solidCircle = new SolidCircle({
  cx: width / 2,
  cy: height / 2,
  color: '#00FF00',
  radius: 100
});

solidCircle.draw();

var strokeCircle = new StrokeCircle({
  cx: width / 2,
  cy: height / 2,
  color: '#FF0000',
  radius: 50,
  strokeWidth: 10
});

strokeCircle.draw();



/*
// Shooogurrr
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  area() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }
}

// Rectangle
console.log('RECTANGLE');
console.dir(Rectangle.prototype); // Object with area function and stuff 
console.dir(Object.getPrototypeOf(Rectangle)); // General Function prototype

console.log('SQUARE');
console.dir(Square.prototype); // Object whose prototype is Rectangle's prototype (not __proto__)
console.dir(Object.getPrototypeOf(Square));
*/
