Pear2PearLoading = (function() {
  var container, leftPear, rightPear,
      triangles = [];

  var intervalId;

  var rightImgOffset = 250;

  var xCells = 6;
  var yCells = 8;

  function Triangle(direction) {
    this.direction = direction;

    this.element = document.createElement('div');
    this.element.className = "loading-triangle";
    this.element.style.borderBottomColor = this.randomColor();

    this.origin = this.randomPosition(this.direction);
    this.destination = this.randomPosition(this.direction ^ 1);
  }

  Triangle.prototype = {
    colors: [
      "00B59D", "0A5843", "1363A7", "1ABEDC", "4F2641", "52C9E6", "68C5A6",
      "A6C76C", "AB2035", "EC2F81", "EE2539", "F3735D", "F5979C", "FAB35D"           
    ],
    randomColor: function randomColor() {
      return "#" + this.colors[Math.floor(Math.random() * this.colors.length)];
    },
    randomCellPosition: function randomCellPosition() {
      return [
        Math.floor(Math.random() * xCells),
        Math.floor(Math.random() * yCells)
      ];
    },
    /* Set a random cell the triangle is going from or to
     *
     * direction is 0 or 1, left or right pear
     */
    randomPosition: function randomPosition(direction) {
      // plus offset if position is in the right
      directionOffset = direction * rightImgOffset;

      cell = this.randomCellPosition();
      
      // There are two triangles by cell
      cellComplement = Math.floor(Math.random() * 2);

      // Adjacent cells are rotated 180
      cellRotated = (cell[0] + cell[1]) % 2;

      finalRotation = (45 + cellComplement * 180 + cellRotated * 90) % 360;

      switch(finalRotation) {
      case 45:
        rotationOffset = [0, 0];
        break;
      case 135:
        rotationOffset = [0, 7];
        break;
      case 225:
        rotationOffset = [-7, 7];
        break;
      case 315:
        rotationOffset = [-7, 0];
        break;
      default:
        console.log("Imposible final rotation: " + finalRotation);
      }
       
      return [
        // 10px per cell + directionOffset
        cell[0] * 14 + directionOffset + rotationOffset[0],
        // 10px per cell
        cell[1] * 14 + rotationOffset[1],
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
      e.target.style.zIndex = -1;
    },
    draw: function draw() {
      this.element.style.left = this.origin[0];
      this.element.style.top = this.origin[1];
      this.rotate(this.origin[2]);

      document.body.appendChild(this.element);
    },
    animate: function animate() {
      this.element.style.zIndex = 10;
      this.element.style.left = this.destination[0];
      this.element.style.top = this.destination[1];
      this.rotate(720 + this.destination[2]);
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


  var getPosition = function(id) {
    el = document.getElementById(id);
    rect = el.getBoundingClientRect();
    
    return [ rect.left + rect.width / 2, rect.top + rect.height / 2 ];
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

