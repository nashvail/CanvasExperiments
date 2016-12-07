'use strict';

// Extending Object constructor with .extend feature
Object.prototype.extend = function (extension) {
  var object = Object.create(this);
  for (var property in extension) {
    if (extension.hasOwnProperty(property) || object[property] === 'undefined') {
      object[property] = extension[property];
    }
  }
  return object;
};

var colors = ["#AA78CA", "#FF6940", "#00BD94", "#FF5363", "#FF71A0", "#006FAD", "#51B46D", "#F7921E",
  "#295D73", "#41C980", "#34ADD3", "#D34E53", "#E7EAEC", "#8A7365", "#FF8051"
];

var height = window.innerHeight,
  width = window.innerWidth;

var canvas = document.getElementById('demo-canvas');
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, width, height);

var Circle = {
  create({cx = 0, cy = 0, radius = 20, sA = 0, eA = 2 * Math.PI, filled = true, color = '#FF0000', strokeWidth = 3}
    = { cx: 0, cy: 0, radius: 20, sA: 0, eA: 2 * Math.PI, filled: true, color: '#FF0000', strokeWidth: 3 }) {
    return this.extend({ cx, cy, radius, sA, eA, filled, color, strokeWidth });
  },
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
};

var Ball = Circle.extend({
  create(config, e = 0.5) { // e is the coefficient of restitution
    var ball = Circle.create.call(this, config);
    ball.e = e;
    ball.vy = 0;
    ball.vx = 0;
    return ball;
  }
});

var MetalBall = Ball.extend({
  create(config) {
    return Ball.create.call(this, config, 0.3);
  }
});

var RubberBall = Ball.extend({
  create(config) {
    return Ball.create.call(this, config, 0.95);
  }
});

var balls = [];
var defaultBallConfig = { radius: 30, cx: width / 2, cy: 0, color: '#00FF00' };

for (var i = 0; i < 15; i++) {
  balls[i] = Ball.create(defaultBallConfig.extend({
    radius: randomInRange(15, 45),
    cx: randomInRange(50, width - 50),
    color: colors[randomIntInRange(0, colors.length - 1)]
  }),
    randomInRange(0.4, 0.6));
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var rId;
var acc = 3;

function nextFrame() {
  ctx.clearRect(0, 0, width, height);
  for (var j = 0; j < 15; j++) {
    if (didCollideWithGround(balls[j])) {
      balls[j].vy *= -balls[j].e;
    }

    if (balls[j].cy + balls[j].radius > height)
      balls[j].cy = height - balls[j].radius;

    balls[j].vy += acc;
    balls[j].cy += balls[j].vy;
    balls[j].draw();
  }

  requestAnimationFrame(nextFrame);
}

function didCollideWithGround(ball) { // Checks if the ball has collided with the ground
  return ball.cy + ball.radius >= height;
}

(function init() {
  rId = requestAnimationFrame(nextFrame);
})();