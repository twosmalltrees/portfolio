/// Global variables ///

var spawnEnemiesInterval;

///////// ------------ THE ROCKET SHIP ------------ ////////

Rocket = {
  velocity: 0,
  direction: 0,
  position: [700, 0],
  lastBulletFired: new Date(),
  image: $("<img class='rocket' src='images/rocket.png'><img class='rocketFlame' src='images/rocketFlame.png'>"),
  fireEngines: function() {
    // Run on up button keydown.
    if (this.velocity <= 12) {
      this.velocity += 0.5;
      $('.rocketFlame').css({
        'transform': 'scaleY(4) translateY(5px)'
      });
    }
  },

  steer: function(rotation) {
    if (rotation === 'clockwise') {
      this.direction += 3;
      $('.rocketDiv').css({
        'transform': 'rotate(' + this.direction + 'deg)'
      });
    } else if (rotation === 'counterClockwise') {
      this.direction -= 3;
      $('.rocketDiv').css({
        'transform': 'rotate(' + this.direction + 'deg)'
      });
    }
  },

  airResistance: function() {
    // Run on keyup, and while velocity is greater than 0.
    if (Rocket.velocity > 0.15) {
      Rocket.velocity = Rocket.velocity - 0.1;
    } else if (Rocket.velocity < 0.15 && Rocket.velocity > 0) {
      Rocket.velocity = 0;
    }
  },

  fireWeapon: function() {
    var bullet = Guns.bulletFactory("laser");
    var fireRate = bullet.fireRate;
    var currentTime = new Date();
    if (currentTime - this.lastBulletFired > fireRate) {
      $('#game-window').append(bullet.image);
      this.lastBulletFired = currentTime;
      World.projectiles.push(bullet);
    }
  }
};


///////// ------------ THE PROJECTS ------------ ////////

Project = {
  // Creates a new enemy
  currentlyViewing: null,
  projectFactory: function(name) {

    var project = {
      position: [],
      velocity: 0.5,
      direction: 0,
      rotation: 0,
      isHittable: true,
      hits: 0,
      size: 40,
      projectName: name,
      contentDivId: name,
      element: null
    };

    // Get randomised spawn conditions
    var spawnConditions = World.randomSpawnCondition();

    // Assign initial direction
    project.direction = spawnConditions.direction;
    project.position = spawnConditions.position;

    // Create a dom_element for the project to append to DOM based on conditions provided

    project.element = $("<div>");
    project.element.addClass("projectIcon " + name);


    // Attach position to the CSS
    project.element.css({
      'left': project.position[0] + "px",
      'top': project.position[1] + "px",
    });

    // Append the project to the DOM
    $('#game-window').append(project.element);
    return project;

  },

  wobble: function(project) {
    // If project has already been hit 3 times, expand ball.
      $(project.element).css({
        'width': project.size + 'px',
        'height': project.size + 'px',
        'transform': 'scale(1.3) scaleX(1.2)',
      });
      setTimeout(function() {
        $(project.element).css({
          'transform': 'scaleX(1)',
        });
      }, 180);
      setTimeout(function() {
        $(project.element).css({
          'transform': 'scaleY(1.15)',
        });
      }, 400);
      setTimeout(function() {
        $(project.element).css({
          'transform': 'scaleY(1)',
        });
        project.isHittable = true;
      }, 600);


  },

  expandBlob: function(project) {
    this.currentlyViewing = project;
    project.isHittable = false;
    var windowWidth = $(window).width();
    var scale;
    if (windowWidth > 3000) {
      scale = 80;
    } else {
      scale = 50;
    }

    if (project.projectName === "about-me") {
      $(project.element).css({
        "background-image": "none",
      });
    }

    $(project.element).css({
      'z-index': '10000000000000000',
      'transform': 'scale(' + scale + ')'
    });

    setTimeout(function() {
      $('#main-content').show();
      $('#' + Project.currentlyViewing.projectName ).fadeTo(1000, 1);
    }, 1000);

    project.size = 40;
    project.hits = 0;

  },

  shrinkBlob: function(project) {
    project.isHittable = true;
    $(project.element).css({
      'transform': 'scale(1)',
      'width': project.size +'px',
      'height': project.size +'px'
    });

    if (project.projectName === "about-me") {
      console.log("about me shrink ran");
      setTimeout(function() {
        $(project.element).css({
          'background-image': 'url(../portfolio/images/me.png)',
        });
      }, 450);
    }

    $('#' + Project.currentlyViewing.projectName ).hide();
  }
};

///////// ------------ THE ENEMIES ------------ ////////

Enemy = {
  // Creates a new enemy
  enemyFactory: function() {
    var enemy = {
      position: [],
      velocity: 1,
      direction: 0,
      size: 25,
    };

    // Assign image based on randomly generated enemy type
    var enemyRandomiser = World.getRandom();

    if (enemyRandomiser < 0.5) {
      enemy.enemyType = "nought";
      enemy.image = $("<div class='enemy nought'><i class='fa fa-circle-o'></i></div>");
    } else {
      enemy.enemyType = "cross";
      enemy.image = $("<div class='enemy cross'><i class='fa fa-times'></i></i></div>");
    }

    var spawnConditions = World.randomSpawnCondition();

    // Assign initial direction
    enemy.direction = spawnConditions.direction;
    enemy.position = spawnConditions.position;

    // Attach position to the CSS
    enemy.image.css({
      'left': enemy.position[0] + "px",
      'top': enemy.position[1] + "px",
    });

    // Append the enemy to the DOM
    $('#game-window').append(enemy.image);
    return enemy;
  },
  explode: function(enemy) {
    enemy.image.html("<img class='explosion' src='images/explosion.png'>");
    enemy.image.css({
      'transform': 'scale(1.5,1.5)'
    });
    setTimeout(function() {
      enemy.image.css({
        'opacity': '0'
      });
    }, 250);
  }
};

///////// ----------------- GUNS ----------------- ////////

Guns = {
  bulletFactory: function(type) {
    // Creates a new bullet
    var bullet = {
      position: [Rocket.position[0] + 19, Rocket.position[1] + 40],
      velocity: Rocket.velocity,
      direction: Rocket.direction,
      fireRate: 0,
      lifetime: 0,
      bulletType: type,
      width: 5,
      image: $("<div class='bullet " + type + "'></div>")
    };
    // Set speed relative to spaceship based on type of bullet
    if (bullet.bulletType === "laser") {
      bullet.velocity += 10;
      bullet.fireRate = 130;
    }
    // Set starting position of bullet at spaceships location
    bullet.image.css({
      'left': bullet.position[0] + "px",
      'bottom': bullet.position[1] + "px",
      'transform': 'rotate(' + bullet.direction + 'deg)'
    });
    return bullet;
  }
};

///////// ----------------- WORLD ----------------- ////////

World = {
  // Stores a collection of all the enemies.
  enemies: [],
  // Stores a collection of bullets.
  projectiles: [],
  // Store a collection of the projects.
  projects: [],
  // Stores the current score.
  score: 0,
  // Sets up an interval to call renderPage every 40ms (25fps);
  start: function() {
    requestAnimationFrame(this.renderPage);
  },
  // Updates the users score on screen.
  updateScore: function() {
    $('.scoreCount').html(World.score);
  },

  renderPage: function() {
    // First, action all user button presses:
    UserInteraction.actionUserInput();

    // DETECT COLLISIONS - loop through World.projectiles and World.enemies and check collisions.
    // Thanks to MDN for this collision detection algorithm.
    for (var k = 0; k < World.enemies.length; k++) {
      for (var m = 0; m < World.projectiles.length; m++) {
        if (World.enemies[k]) { // This loop is important, prevents from attempting to check collisions on World.enemies[k] if it was the most recently generated enemy and has been hit and destroyed already, and therefore World.enemies[k] no longer exists.
          var thisEnemy = World.enemies[k];
          var enemyXPos = thisEnemy.image.offset().left + (thisEnemy.size / 2);
          var enemyYPos = thisEnemy.image.offset().top + (thisEnemy.size / 2);
          var thisBullet = World.projectiles[m];
          var bulletXPos = thisBullet.image.offset().left + (thisBullet.width / 2);
          var bulletYPos = thisBullet.image.offset().top + (thisBullet.width / 2);
          var bulletRadius = 5;
          var enemyRadius = 12.5;

          var dx = enemyXPos - bulletXPos;
          var dy = enemyYPos - bulletYPos;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < bulletRadius + enemyRadius) {
            Enemy.explode(World.enemies[k]);
            thisBullet.image.css({
              'display': 'none'
            });
            World.enemies.splice(k, 1);
            World.projectiles.splice(m, 1);
            World.score += 1;
            World.updateScore();
          }
        }
      }
    }

    // DETECT COLLISIONS FOR PROJECTS - loop through World.projectiles and World.enemies and check collisions.
    // Thanks to MDN for this collision detection algorithm.
    for (var i = 0; i < World.projects.length; i++) {
      for (var j = 0; j < World.projectiles.length; j++) {
        if (World.projects[i]) { // This loop is important, prevents from attempting to checi collisions on World.projects[i] if it was the most recently generated enemy and has been hit and destroyed already, and therefore World.projects[i] no longer exists.
          var thisProject = World.projects[i];
          var projectXPos = thisProject.element.offset().left + (thisProject.size / 2);
          var projectYPos = thisProject.element.offset().top + (thisProject.size / 2);
          var thatBullet = World.projectiles[j];
          var thatBulletXPos = thatBullet.image.offset().left + (thatBullet.width / 2);
          var thatBulletYPos = thatBullet.image.offset().top + (thatBullet.width / 2);
          var thatBulletRadius = 5;
          var projectRadius = thisProject.size / 2;

          var dxx = projectXPos - thatBulletXPos;
          var dyy = projectYPos - thatBulletYPos;
          var theDistance = Math.sqrt(dxx * dxx + dyy * dyy);

          if (theDistance < thatBulletRadius + projectRadius) {
            if (thisProject.isHittable === true) {
              if (thisProject.hits >= 3) {
                thisProject.isHittable = false;
                Project.expandBlob(thisProject);
              } else if (thisProject.hits < 3) {
                thisProject.isHittable = false;
                thisProject.size += 30;
                thisProject.hits += 1;
                Project.wobble(thisProject);
              }
            }
            thatBullet.image.css({
              'display': 'none'
            });
            World.projectiles.splice(j, 1);
          }
        }
      }
    }

    // ROCKET - checks and update the position of the rocket
    var rocket_image_div = Rocket.image;
    var velocity_components = World.breakDownVelocity(Rocket.velocity, Rocket.direction);

    // Allows for flyThrough walls on X axis
    if (Rocket.position[0] < -150) {
      Rocket.position[0] = $(window).width() + ((Rocket.position[0] + velocity_components[0] + 150) % $(window).width());
    } else if (Rocket.position[0] > $(window).width() + 50) {
      console.log("to right");
      Rocket.position[0] = ((Rocket.position[0] + velocity_components[0]) % $(window).width()) - 150;
    } else {
      Rocket.position[0] = Rocket.position[0] + velocity_components[0];
    }

    // Allows for flyThrough floor/ceiling on Y axis
    if (Rocket.position[1] < -150) {
      Rocket.position[1] = $(window).height() + ((Rocket.position[1] + velocity_components[1] + 150) % $(window).height());
    } else if (Rocket.position[1] > $(window).height() + 50) {
      console.log("to right");
      Rocket.position[1] = ((Rocket.position[1] + velocity_components[1]) % $(window).height()) - 150;
    } else {
      Rocket.position[1] = Rocket.position[1] + velocity_components[1];
    }


    $('.rocketDiv').css({
      'left': Rocket.position[0] + 'px',
      'bottom': Rocket.position[1] + 'px'
    });

    // BULLETS - check and update the position of all World.projectiles
    for (var i = 0; i < World.projectiles.length; i++) {
      var bullet = World.projectiles[i];
      var bullet_div = bullet.image;
      velocity_components = World.breakDownVelocity(bullet.velocity, bullet.direction);
      bullet.position[0] += velocity_components[0];
      bullet.position[1] += velocity_components[1];

      // Checks bullet lifetime. If it has existed for longer than 150 iterations, it is spliced from the World.projectiles array so as to not track bullets flying miles off screen.
      if (bullet.lifetime < 150) {
        bullet.lifetime++;
      } else {
        bullet_div.remove();
        World.projectiles.splice(i, 1);
        bullet.image.css({
          'display': 'none'
        });
      }
      // Update posiiton of the bullet on screen.
      bullet.image.css({
        'left': bullet.position[0] + 'px',
        'bottom': bullet.position[1] + 'px'
      });
    }

    // ENEMIES - check and update the position of all World.projectiles
    for (var j = 0; j < World.enemies.length; j++) {
      var enemy = World.enemies[j];
      var enemy_div = enemy.image;
      velocity_components = World.breakDownVelocity(enemy.velocity, enemy.direction);
      enemy.position[0] += velocity_components[0];
      enemy.position[1] += velocity_components[1];
      enemy.image.css({
        'left': enemy.position[0] + 'px',
        'top': enemy.position[1] + 'px'
      });
      // Stop tracking enemies if they stray outside the screen
      if (enemy.position[0] < -50 || enemy.position[0] > $(window).width() + 50 || enemy.position[1] < -50 || enemy.position[1] > $(window).height + 50) {
        enemy_div.remove();
        World.enemies.splice(j, 1);
      }
    }

    // PROJECTS - check and update the position of all the World.projects
    for (var l = 0; l < World.projects.length; l++) {

      var project = World.projects[l];
      var project_div = project.image;
      velocity_components = World.breakDownVelocity(project.velocity, project.direction);
      // Allows for flyThrough walls on X axis
      if (project.position[0] < -150) {
        project.position[0] = $(window).width() + ((project.position[0] + velocity_components[0] + 150) % $(window).width());
      } else if (project.position[0] > $(window).width() + 50) {
        project.position[0] = ((project.position[0] + velocity_components[0]) % $(window).width()) - 150;
      } else {
        project.position[0] = project.position[0] + velocity_components[0];
      }

      // Allows for flyThrough floor/ceiling on Y axis
      if (project.position[1] < -150) {
        project.position[1] = $(window).height() + ((project.position[1] + velocity_components[1] + 150) % $(window).height());
      } else if (project.position[1] > $(window).height() + 50) {
        project.position[1] = ((project.position[1] + velocity_components[1]) % $(window).height()) - 150;
      } else {
        project.position[1] = project.position[1] + velocity_components[1];
      }


      project.element.css({
        'left': project.position[0] + 'px',
        'top': project.position[1] + 'px',
      });

    }
    window.requestAnimationFrame(World.renderPage);
  },

  randomSpawnCondition: function() {
    // Logic to work out random spawn locations
    var sideRandomiser = this.getRandom();
    var positionRandomiser = this.getRandom();
    var directionRandomiser = this.getRandom();

    // Chooses where to place enemy
    var position;
    var direction;

    if (sideRandomiser > 0.75) {
      // Case One - Spawns from top
      position = [($('#game-window').width() * positionRandomiser), 0];
      direction = (90 * directionRandomiser);
    } else if (sideRandomiser > 0.5) {
      // Case Two - Spawns from right
      position = [$('#game-window').width(), ($('#game-window').height() * positionRandomiser)];
      direction = (180 + (180 * directionRandomiser));
    } else if (sideRandomiser > 0.25) {
      // Case Three - Spawns from bottom
      position = [($('#game-window').width() * positionRandomiser), $('#game-window').height()];
      direction = (270 + (180 * directionRandomiser));
    } else {
      // Case Four - Spawns from left
      position = [0, ($('#game-window').height() * positionRandomiser)];
      direction = (180 * directionRandomiser);
    }
    return {
      position: position,
      direction: direction
    };
  },

  breakDownVelocity: function(velocity, direction) {
    var angleFromHorizontal;
    var xComponent;
    if (direction >= 0 && direction <= 90) {
      angleFromHorizontal = this.toRadians(90 - direction); // Converts to radians for input to sin/cos
      xComponent = velocity * Math.cos(angleFromHorizontal);
      yComponent = velocity * Math.sin(angleFromHorizontal);
      return [xComponent, yComponent];
    } else if (direction > 90 && direction <= 180) {
      angleFromHorizontal = this.toRadians(direction - 90);
      xComponent = velocity * Math.cos(angleFromHorizontal);
      yComponent = velocity * Math.sin(angleFromHorizontal) * -1;
      return [xComponent, yComponent];
    } else if (direction > 180 && direction <= 270) {
      angleFromHorizontal = this.toRadians(270 - direction);
      xComponent = velocity * Math.cos(angleFromHorizontal) * -1;
      yComponent = velocity * Math.sin(angleFromHorizontal) * -1;
      return [xComponent, yComponent];
    } else {
      angleFromHorizontal = this.toRadians(direction - 270);
      xComponent = velocity * Math.cos(angleFromHorizontal) * -1;
      yComponent = velocity * Math.sin(angleFromHorizontal);
      return [xComponent, yComponent];
    }
  },
  toRadians: function(angle) {
    return angle * (Math.PI / 180);
  },

  getRandom: function() {
    return Math.random();
  },
};

// Controls all the user input, key listeners logic etc
var UserInteraction = {
  keysPressed: [],
  addKeyboardListeners: function() {
    // When key is pressed, sets it's value in array to true.
    $(window).on("keydown", function(event) {
      UserInteraction.keysPressed[event.keyCode] = true;
    });
    // When released, value is set back to false.
    $(window).on("keyup", function(event) {
      UserInteraction.keysPressed[event.keyCode] = false;
    });
  },
  actionUserInput: function() {
    // Fire Engines, stop air resistance function.
    if (UserInteraction.keysPressed[38]) {
      Rocket.fireEngines();
    }
    // Counter clockwise turn on left button press
    if (UserInteraction.keysPressed[37]) {
      Rocket.steer('counterClockwise');
    }
    //Clockwise turn on right button press
    if (UserInteraction.keysPressed[39]) {
      Rocket.steer('clockwise');
    }
    // Fire Laser!
    if (UserInteraction.keysPressed[32]) {
      Rocket.fireWeapon();
    }
    // Reduce rocket flame size on keyup, and set air resistance interval up again.
    if (UserInteraction.keysPressed[38] === false) {
      Rocket.airResistance();
      $('.rocketFlame').css({
        'transform': 'scaleY(1.5) translateY(0px)'
      });
    }
  }
};

Welcome = {
  showWelcome: function() {
    $('.rocketDiv').append(Rocket.image).fadeTo(2000, 1);
    $('#welcome-container').fadeTo(2000, 1, function() {
      setTimeout(Welcome.showViewOptions(), 1500);
    });

  },

  showViewOptions: function() {
    $('.welcome-small-text').first().fadeTo(600, 0);
    $('#welcome-container').css({'top':'29vh'});
    $('#view-options').fadeIn();
  },

  showIntroSequence: function() {
    // Will show the control intro when user selects to play the game
    $('#welcome-message').fadeTo(500, 0, function() {
      $('#welcome-message').hide();
    });
    // Fade in the controls image
    setTimeout(function() {
      $('#controls').fadeTo(500, 1);
    }, 700);

    setTimeout(function() {
      $('#controls').fadeTo(500, 0, function() {
        $('#controls').hide();
      });
    }, 3000);

    Welcome.startGame();
  },

  showAllProjects: function() {
    // $('#game-window').css({'overflow':'scroll'});
    $('body').css({
      "overflow-y": "scroll"
    });
    $('.close-project').hide();
    $('.project-container').show();
    $('#main-content').fadeTo(300, 1);
  },

  startGame: function() {
    UserInteraction.addKeyboardListeners();
    // Sets up spawn enemies interval
    setTimeout(function() {
      setInterval(function() {
        if (World.enemies.length < 15) {
          var enemy = Enemy.enemyFactory();
          World.enemies.push(enemy);
        }
      }, 2000);
    }, 1000);

    if (World.projects.length === 0) {
      World.projects.push(Project.projectFactory("gipht"),
                          Project.projectFactory("tic-tac-toe"),
                          Project.projectFactory("glance"),
                          Project.projectFactory("contribute"),
                          Project.projectFactory("spaced"),
                          Project.projectFactory("about-me"));
      World.start();
    }

    $('#game-window').fadeTo(1500, 1);
  }

};

$(document).ready(function() {
  setTimeout(function() {
    Welcome.showWelcome();
  }, 500);

  $('#start-game').on('click', function(){
    Welcome.showIntroSequence();
  });

  $('#quick-view').on('click', function() {
    Welcome.showAllProjects();
  });

  // Listen for click on close buttons
  $('.close-project').on('click', function() {
    console.log("close project called");
    $('#' + Project.currentlyViewing.projectName ).fadeTo(500, 0, function() {
      $('#main-content').hide();
      Project.shrinkBlob(Project.currentlyViewing, function() {});
    });
  });
});

// The Below Code Runs The Game On Page Ready... Re Implement Later

// $(document).ready(function() {
//
//   UserInteraction.addKeyboardListeners();
//
//   // Sets up spawn enemies interval
//   setTimeout(function() {
//     setInterval(function() {
//       if (World.enemies.length < 15) {
//         var enemy = Enemy.enemyFactory();
//         World.enemies.push(enemy);
//       }
//     }, 2000);
//   }, 1000);
//
//   World.projects.push(Project.projectFactory("gipht"), Project.projectFactory("tic-tac-toe"));
//
//   $('.rocketDiv').append(Rocket.image);
//
//
//   World.start();
//
// });
