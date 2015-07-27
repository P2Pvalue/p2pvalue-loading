Pear2PearLoading = (function() {
  var container, leftPear, rightPear,
      leftPearOffset, rightPearOffset,
      triangles = [];

  var intervalId;

  var xCells = 6;
  var yCells = 8;

  function Triangle() {
    this.build();
    this.locate(this.destination);
  }


  Triangle.prototype = {
    /*
     * Dynamic, will be set in resize function
     */
    className: "pear2pear-loading-triangle pear2pear-loading-static-triangle",
    sideSize: 1,
    hypotenuseSize: function hypotenuseSize() {
      return this.sideSize * Math.sqrt(2);
    },
    colors: [
      "00B59D", "0A5843", "1363A7", "1ABEDC", "4F2641", "52C9E6", "68C5A6",
      "A6C76C", "AB2035", "EC2F81", "EE2539", "F3735D", "F5979C", "FAB35D"           
    ],
    randomColor: function randomColor() {
      return "#" + this.colors[Math.floor(Math.random() * this.colors.length)];
    },
    build: function build() {
      this.element = document.createElement('div');
      this.element.className = this.className;

      this.element.style.borderBottomColor = this.randomColor();

      // The div becomes a right triangle whose hypotenuse is the border width
      this.element.style.borderLeftWidth =
        this.element.style.borderRightWidth =
        this.element.style.borderBottomWidth =
        this.hypotenuseSize() / 2;

      // This triangle is in left or right Pear
      this.pearSide = Math.floor(Math.random() * 2);

      // Position insde the Pear
      this.destination = this.randomPosition();
    },
    /*
     * Set a random cell the triangle is going from or to
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
     * This triangle is located in left or right pear
     */
    pearSideOffset: function pearSideOffset(s) {
        if (s) {
          return rightPearOffset;
        } else {
          return leftPearOffset;
        }
      },
    /*
     * The relative coordinates inside a Pear
     *
     * Given a position, it is translated to pixels
     */
    coordinates: function coordinates(position, pearSide) {
      // Adjacent cells are rotated 180
      var cellRotated = (position[0] + position[1]) % 2;

      // offset + cell complement + rotated cell
      var finalRotation = (45 + position[2] * 180 + cellRotated * 90) % 360;

      /* 
       * There is a rotation offset when placing the triangle,
       * the rotation center is at the center of the rectangle,
       * so we have to move it a little bit
       */

      var peakDistance = this.hypotenuseSize() * (Math.sqrt(2) - 1) / 4;
      var inDistance = this.hypotenuseSize() / 2 + peakDistance;

      var rotationOffset;

      switch(finalRotation) {
      case 45:
        rotationOffset = [
          this.hypotenuseSize() * (3 * Math.sqrt(2) / 2 - 2) / 4,
          this.hypotenuseSize() * (1 / Math.sqrt(2) - 1) / 4
        ];
        break;
      case 135:
        rotationOffset = [
          this.hypotenuseSize() * (3 * Math.sqrt(2) / 2 - 2) / 4,
          this.hypotenuseSize() * (3 * Math.sqrt(2) / 2 - 1) / 4
        ];
        break;
      case 225:
        rotationOffset = [
          this.hypotenuseSize() * (1 / Math.sqrt(2) - 2) / 4,
          this.hypotenuseSize() * (3 * Math.sqrt(2) / 2 - 1) / 4
        ];
        break;
      case 315:
        rotationOffset = [
          this.hypotenuseSize() * (1 / Math.sqrt(2) - 2) / 4,
          this.hypotenuseSize() * (1 / Math.sqrt(2) - 1) / 4
        ];
        break;
      default:
        console.log("Imposible final rotation: " + finalRotation);
      }

      return [
        this.pearSideOffset(pearSide) +
        position[0] * this.sideSize +
          rotationOffset[0],
        position[1] * this.sideSize +
          rotationOffset[1],
        finalRotation
      ];
    },
    rotate: function rotate(deg) {
      this.element.style.transform =
        this.element.style.webkitTransform =
        "rotate(" + deg + "deg)";
    },
    locate: function locate(position, pearSide) {
      if (pearSide === undefined) {
        pearSide = this.pearSide;
      }

      var coord = this.coordinates(this.destination, pearSide);

      this.element.style.left = coord[0];
      this.element.style.top = coord[1];
      this.rotate(coord[2]);

      container.appendChild(this.element);
    },
  };

  function MovingTriangle() {
    this.origin = this.randomPosition();

    this.build();
    this.locate(this.origin, this.pearSide ^ 1);
    this.move();
  }

  function MovingTriangleProto() {
    this.className = "pear2pear-loading-triangle pear2pear-loading-moving-triangle";
    this.transitioned = function transitioned(e) {
        this.className = Triangle.prototype.className;
      };
    this.animate = function animate() {
        var coord = this.coordinates(this.destination, this.pearSide);

        this.element.style.left = coord[0];
        this.element.style.top = coord[1];
        this.rotate(720 + coord[2]);
        this.element.addEventListener("webkitTransitionEnd", this.transitioned, true);
        this.element.addEventListener("transitionend", this.transitioned, true);
      };
    this.move = function move() {
        var t = this;
        setTimeout(function() {
          t.animate();
        }, 40);
      };
  }

  MovingTriangleProto.prototype = Triangle.prototype;

  MovingTriangle.prototype = new MovingTriangleProto();

  var createTriangle = function(position) {
    pos = position;
    var t = new Triangle();

    triangles.push(t);

    return t;
  };

  var createMovingTriangle = function() {
    var t = new MovingTriangle();

    triangles.push(t);

    return t;
  };

  function setSize() {
    var containerWidth = container.clientWidth;

    leftPear.style.fontSize =
      rightPear.style.fontSize =
      containerWidth * 0.25;

    leftPear.style.marginLeft =
      leftPear.style.marginRight =
      rightPear.style.marginLeft =
      rightPear.style.marginRight =
      containerWidth * 0.15;

    Triangle.prototype.sideSize = containerWidth * 0.03125;

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

    for (var i = 0; i < xCells * yCells; i++) {
      createTriangle();
    }

    start();
  }

  var start = function() {
    intervalId = setInterval(function() { createMovingTriangle(); }, 1000);
  };

  var pause = function() {
    window.clearInterval(intervalId);
  };
 
  return { 
    m: MovingTriangle,
    m2: MovingTriangleProto,
    createTriangle: createTriangle,
    createMovingTriangle: createMovingTriangle,
    create: create,
    start: start,
    pause: pause
  };
})();

