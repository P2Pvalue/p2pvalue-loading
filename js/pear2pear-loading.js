Pear2PearLoading = (function() {
  var container, leftPear, rightPear,
      leftPearOffset, rightPearOffset,
      triangles = [];

  var intervalId;

  var xCells = 6;
  var yCells = 8;

  function Triangle(direction) {
    this.direction = direction;

    this.element = document.createElement('div');
    this.element.className = "loading-triangle";

    this.element.style.borderBottomColor = this.randomColor();
    // The div becomes a right triangle whose hypotenuse is the border width
    this.element.style.borderLeftWidth =
      this.element.style.borderRightWidth =
      this.element.style.borderBottomWidth =
      this.hypotenuseSize;

    this.origin = this.randomPosition();
    console.log(this.origin);
    this.destination = this.randomPosition();
    console.log(this.destination);
  }

  Triangle.prototype = {
    /*
     * Dynamic, will be set in resize function
     */
    hypotenuseSize: 1,
    sideSize: function sideSize() {
      return this.hypotenuseSize / Math.sqrt(2);
    },
    colors: [
      "00B59D", "0A5843", "1363A7", "1ABEDC", "4F2641", "52C9E6", "68C5A6",
      "A6C76C", "AB2035", "EC2F81", "EE2539", "F3735D", "F5979C", "FAB35D"           
    ],
    randomColor: function randomColor() {
      return "#" + this.colors[Math.floor(Math.random() * this.colors.length)];
    },
    directionOffset: function directionOffset(direction) {
      if (direction) {
        return rightPearOffset;
      } else {
        return leftPearOffset;
      }
    },
    /* Set a random cell the triangle is going from or to
     *
     * Returns an array with:
     *   order of cell in X
     *   order of cell in Y
     *   cellComplement: cells have two triangles: 0 or 1
     *
     */
    randomPosition: function randomPosition() {
      return [
        Math.floor(Math.random() * xCells),
        Math.floor(Math.random() * yCells),
        Math.floor(Math.random() * 2)
      ];
    },
    /*
     * The relative coordinates inside a Pear
     *
     * Given a position, it is translated to pixels
     */
    coordinates: function coordinates(position, direction) {
      // Adjacent cells are rotated 180
      var cellRotated = (position[0] + position[1]) % 2;

      var finalRotation = (45 + position[2] * 180 + cellRotated * 90) % 360;

      var rotationOffset;

      switch(finalRotation) {
      case 45:
        rotationOffset = [0, 0];
        break;
      case 135:
        rotationOffset = [0, 1];
        break;
      case 225:
        rotationOffset = [-1, 1];
        break;
      case 315:
        rotationOffset = [-1, 0];
        break;
      default:
        console.log("Imposible final rotation: " + finalRotation);
      }
       
      return [
        this.directionOffset(direction) +
        position[0] * this.sideSize() +
          rotationOffset[0] * this.hypotenuseSize / 2,
        position[1] * this.sideSize() +
          rotationOffset[1] * this.hypotenuseSize / 2,
        // offset + cell complement + rotated cell
        finalRotation
      ];
    },
    rotate: function rotate(deg) {
      this.element.style.transform =
        this.element.style.webkitTransform =
        "rotate(" + deg + "deg)";
    },
    transitioned: function transitioned(e) {
     // e.target.style.zIndex = -1;
    },
    draw: function draw() {
      var coord = this.coordinates(this.origin, this.direction);

      this.element.style.left = coord[0];
      this.element.style.top = coord[1];
      this.rotate(coord[2]);

      document.body.appendChild(this.element);
    },
    animate: function animate() {
      var coord = this.coordinates(this.destination, this.direction ^ 1);

      this.element.style.zIndex = 10;
      this.element.style.left = coord[0];
      this.element.style.top = coord[1];
      this.rotate(720 + coord[2]);
      this.element.addEventListener("webkitTransitionEnd", this.transitioned, true);
      this.element.addEventListener("transitionend", this.transitioned, true);
    },
    move: function move() {
      this.draw();

      var t = this;
      setTimeout(function() {
        t.animate();
      }, 40);
    }
  };

  var createTriangle = function() {
    var t = new Triangle(Math.floor(Math.random() * 2));

    triangles.push(t);

    t.move();

    return t;
  };

  function setSize() {
    var containerWidth = container.clientWidth;
    console.log(containerWidth);

    leftPear.style.fontSize =
      rightPear.style.fontSize =
      containerWidth * 0.25;

    leftPear.style.marginLeft =
      leftPear.style.marginRight =
      rightPear.style.marginLeft =
      rightPear.style.marginRight =
      containerWidth * 0.15;

    Triangle.prototype.hypotenuseSize = containerWidth * 0.03125;

    // Left margin
    leftPearOffset = containerWidth * 0.15;
    // leftPear margins plus rightPear margin plus leftPear
    rightPearOffset = containerWidth * (0.15 * 3 + 0.25 * 0.75);
  }

  function create(el) {
    container =  document.getElementById(el);
    container.className = 'pear2pear-loading-container';
      
    leftPear = document.createElement('div');
    leftPear.className = 'pear2pear-loading-pear pear2pear-loading-pear-left';
    container.appendChild(leftPear);

    rightPear = document.createElement('div');
    rightPear.className = 'pear2pear-loading-pear pear2pear-loading-pear-right';
    container.appendChild(rightPear);

    setSize();

    window.onresize = setSize;
  }

  var start = function() {
    intervalId = setInterval(function() { createTriangle(); }, 1000);
  };

  var pause = function() {
    window.clearInterval(intervalId);
  };
 
  return { 
    createTriangle: createTriangle,
    create: create,
    start: start,
    pause: pause
  };
})();

