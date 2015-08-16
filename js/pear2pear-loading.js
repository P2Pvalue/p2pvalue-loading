Pear2PearLoading = (function() {
  var container, leftPear, rightPear,
      leftPearOffset, rightPearOffset,
      topOffset = 0,
      mandatoryCoordinates = [
        [2, 0, 0] // L
      ],
      bannedCoordinates = [
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 1],
        [2, 0, 1], // 7
        [3, 0, 0],
        [3, 0, 1],
        [4, 0, 0],
        [4, 0, 1],
        [5, 0, 0],
        [5, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [5, 1, 0],
        [5, 1, 1],
        [0, 2, 0],
        [0, 2, 1],
        [5, 2, 0],
        [5, 2, 1],
        [0, 3, 1], // F
        [5, 3, 0], // J
        [0, 6, 1], // L
        [5, 6, 0], // J
        [0, 7, 0],
        [0, 7, 1],
        [1, 7, 1], // L
        [4, 7, 0], // J
        [5, 7, 0],
        [5, 7, 1],
      ],
      triangles = [[], []];

  var intervalId;

  var xCells = 6;
  var yCells = 8;

  function Triangle(opts) {
    this.build(opts);
    this.locate(this.destination);
  }


  Triangle.prototype = {
    /*
     * Dynamic, will be set in resize function
     */
    className: "pear2pear-loading-triangle pear2pear-loading-static-triangle",
    sideSize: 1,
    hypotenuseSize: function hypotenuseSize() {
      return this.sideSize * Math.sqrt(2) - 1;
    },
    colors: [
      "00B59D", "0A5843", "1363A7", "1ABEDC", "4F2641", "52C9E6", "68C5A6",
      "A6C76C", "AB2035", "EC2F81", "EE2539", "F3735D", "F5979C", "FAB35D"
    ],
    randomColor: function randomColor() {
      return "#" + this.colors[Math.floor(Math.random() * this.colors.length)];
    },
    build: function build(opts) {
      opts = opts || {};

      this.element = document.createElement('div');
      this.element.className = this.className;

      this.element.style.borderBottomColor = this.randomColor();

      // The div becomes a right triangle whose hypotenuse is the border width
      this.element.style.borderLeftWidth =
        this.element.style.borderRightWidth =
        this.element.style.borderBottomWidth =
        this.hypotenuseSize() / 2 + 'px';

      // This triangle is in left or right Pear
      this.pearSide =
        opts.hasOwnProperty('pearSide') ?
        opts.pearSide :
        Math.floor(Math.random() * 2);

      // Position insde the Pear
      this.destination =
        opts.destination ||
        this.randomPosition();
    },
    validRandomPosition: function validRandomPosition(pos) {
      for (var i in bannedCoordinates) {
        var ban = bannedCoordinates[i];

        if (ban[0] === pos[0] && ban[1] === pos[1] && ban[2] === pos[2]) {
          return false;
        }
      }

      return true;
    },
    /*
     * Set a random cell the triangle is going from or to
     *
     * Returns an array with:
     *   order of cell in X
     *   order of cell in Y
     *   cellComplement: cells have two triangles: 0 or 1
     *
     *   [0, 0, 0] is 7
     *   [0, 0, 1] is L
     *   [1, 0, 0] is J
     *   [1, 0, 1] is F
     *
     */
    randomPosition: function randomPosition() {
      var pos = [
        Math.floor(Math.random() * xCells),
        Math.floor(Math.random() * yCells),
        Math.floor(Math.random() * 2)
      ];

      if (this.validRandomPosition(pos)) {
        return pos;
      } else {
        return this.randomPosition();
      }
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
        1 +
        this.pearSideOffset(pearSide) +
        position[0] * this.sideSize +
          rotationOffset[0],
        1 +
        topOffset +
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

      var coord = this.coordinates(position, pearSide);

      this.element.style.left = coord[0] + 'px';
      this.element.style.top = coord[1] + 'px';
      this.rotate(coord[2]);

      container.appendChild(this.element);
    },
  };

  function MovingTriangle() {
    this.build();

    if (triangles[this.pearSide ^ 1].length) {
      var source =
       triangles[this.pearSide ^ 1][Math.floor(Math.random() * triangles[this.pearSide ^ 1].length)];

       this.origin = source.destination;
    } else {
      this.origin = this.randomPosition();
    }

    this.locate(this.origin, this.pearSide ^ 1);
    this.move();
  }

  function MovingTriangleProto() {
    this.className = "pear2pear-loading-triangle pear2pear-loading-moving-triangle";
    this.transitioned = function transitioned(e) {
        this.className = Triangle.prototype.className;

        // triangles[this.pearSide].push(this);
      };
    this.animate = function animate() {
        var coord = this.coordinates(this.destination, this.pearSide);

        this.element.style.left = coord[0] + 'px';
        this.element.style.top = coord[1] + 'px';
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

  var createTriangle = function(opts) {
    var t = new Triangle(opts);

    triangles[t.pearSide].push(t);

    return t;
  };

  var createMovingTriangle = function() {
    var t = new MovingTriangle();

    return t;
  };

  function createMandatoryTriangles() {
    var pearSides = [0, 1];

    for (var i in mandatoryCoordinates) {
      for (var j in pearSides) {
        createTriangle({
          destination: mandatoryCoordinates[i],
          pearSide: pearSides[j]
        });
      }
    }
  }

  function setSize() {
    var containerWidth = container.clientWidth,
        containerHeight = container.clientHeight,
        paddingTop = (containerHeight - containerWidth * 0.25) / 2;

    if (paddingTop < 0) {
      paddingTop = 0;
    }

    topOffset = paddingTop;
    container.style.paddingTop = paddingTop + 'px';

    leftPear.style.fontSize =
      rightPear.style.fontSize =
      containerWidth * 0.25 + 'px';

    leftPear.style.marginLeft =
      leftPear.style.marginRight =
      rightPear.style.marginLeft =
      rightPear.style.marginRight =
      containerWidth * 0.15 + 'px';

    Triangle.prototype.sideSize = (containerWidth - 1) * 0.03125;

    // Left margin
    leftPearOffset = containerWidth * 0.15;
    // leftPear margins plus rightPear margin plus leftPear
    rightPearOffset = containerWidth * (0.15 * 3 + 0.25 * 0.75);
  }

  function getBackgroundColor(el) {
    var color = el.style.backgroundColor;

    if (color !== '') {
      return color;
    }

    if (el.tagName === 'BODY') {
        // return known 'false' value
      return 'rgb(255, 255, 255)';
    } else {
        // call getBackground with parent item
      return getBackgroundColor(el.parentElement);
    }
  }

  function create(el) {
    // Use 'pear2pear-loading' id by default
    el = el || 'pear2pear-loading';

    container = document.getElementById(el);
    container.className = 'pear2pear-loading-container';

    var color = getBackgroundColor(container);

    leftPear = document.createElement('div');
    leftPear.className = 'pear2pear-loading-pear pear2pear-loading-pear-left';
    leftPear.style.color = color;
    container.appendChild(leftPear);

    rightPear = document.createElement('div');
    rightPear.className = 'pear2pear-loading-pear pear2pear-loading-pear-right';
    rightPear.style.color = color;
    container.appendChild(rightPear);

    setSize();

    window.onresize = setSize;

    createMandatoryTriangles();

    for (var i = 0; i < xCells * yCells * 2; i++) {
      createTriangle();
    }

    start();
  }

  function start() {
    intervalId = setInterval(function() { createMovingTriangle(); }, 1000);
  }

  function pause() {
    clearInterval(intervalId);
  }

  return {
    createTriangle: createTriangle,
    createMovingTriangle: createMovingTriangle,
    create: create,
    start: start,
    pause: pause
  };
})();
