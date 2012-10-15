(function() {
  var axesStatus, checkForGamePad, faye, gamepad, gamepadSupportAvailable, keymap, normalizeSpeed, padStatus, setupGamepad, speed;
  faye = new Faye.Client("/faye", {
    timeout: 120
  });
  faye.subscribe("/drone/navdata", function(data) {
    ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach(function(type) {
      return $("#" + type).html(Math.round(data.demo[type], 4));
    });
    return showBatteryStatus(data.demo.batteryPercentage);
  });
  window.showBatteryStatus = function(batteryPercentage) {
    $("#batterybar").width("" + batteryPercentage + "%");
    if (batteryPercentage < 30) {
      $("#batteryProgress").removeClass("progress-success").addClass("progress-warning");
    }
    if (batteryPercentage < 15) {
      $("#batteryProgress").removeClass("progress-warning").addClass("progress-danger");
    }
    return $("#batteryProgress").attr({
      "data-original-title": "Battery status: " + batteryPercentage + "%"
    });
  };
  faye.subscribe("/drone/image", function(src) {
    return $("#cam").attr({
      src: src
    });
  });
  keymap = {
    87: {
      ev: 'move',
      action: 'front'
    },
    83: {
      ev: 'move',
      action: 'back'
    },
    65: {
      ev: 'move',
      action: 'left'
    },
    68: {
      ev: 'move',
      action: 'right'
    },
    38: {
      ev: 'move',
      action: 'up'
    },
    40: {
      ev: 'move',
      action: 'down'
    },
    37: {
      ev: 'move',
      action: 'counterClockwise'
    },
    39: {
      ev: 'move',
      action: 'clockwise'
    },
    32: {
      ev: 'drone',
      action: 'takeoff'
    },
    27: {
      ev: 'drone',
      action: 'land'
    },
    49: {
      ev: 'animate',
      action: 'flipAhead',
      duration: 15
    },
    50: {
      ev: 'animate',
      action: 'flipLeft',
      duration: 15
    },
    51: {
      ev: 'animate',
      action: 'yawShake',
      duration: 15
    },
    52: {
      ev: 'animate',
      action: 'doublePhiThetaMixed',
      duration: 15
    },
    53: {
      ev: 'animate',
      action: 'wave',
      duration: 15
    },
    69: {
      ev: 'drone',
      action: 'disableEmergency'
    }
  };
  speed = 0;
  $(document).keydown(function(ev) {
    var evData;
    if (keymap[ev.keyCode] == null) {
      return;
    }
    ev.preventDefault();
    speed = speed >= 1 ? 1 : speed + 0.08 / (1 - speed);
    evData = keymap[ev.keyCode];
    return faye.publish("/drone/" + evData.ev, {
      action: evData.action,
      speed: speed,
      duration: evData.duration
    });
  });
  $(document).keyup(function(ev) {
    speed = 0;
    return faye.publish("/drone/drone", {
      action: 'stop'
    });
  });
  $("*[data-action]").on("mousedown", function(ev) {
    return faye.publish("/drone/" + $(this).attr("data-action"), {
      action: $(this).attr("data-param"),
      speed: 0.3,
      duration: 1000 * parseInt($("#duration").val())
    });
  });
  $("*[data-action]").on("mouseup", function(ev) {
    return faye.publish("/drone/move", {
      action: $(this).attr("data-param"),
      speed: $(this).attr("data-action") === "move" ? 0 : void 0
    });
  });
  $("*[rel=tooltip]").tooltip();
  normalizeSpeed = function(val) {
    if (Math.abs(val) < 0.15) {
      return 0;
    }
    return Math.abs(val / 2);
  };
  $(document).on("gamepad:LEFT_ANALOGUE_VERT", function(ev, data) {
    var direction;
    direction = "back";
    if (data.value < 0) {
      direction = "forward";
    }
    return faye.publish("/drone/move", {
      action: direction,
      speed: normalizeSpeed(data.value)
    });
  });
  $(document).on("gamepad:LEFT_ANALOGUE_HOR", function(ev, data) {
    var direction;
    direction = "right";
    if (data.value < 0) {
      direction = "left";
    }
    return faye.publish("/drone/move", {
      action: direction,
      speed: normalizeSpeed(data.value)
    });
  });
  $(document).on("gamepad:RIGHT_ANALOGUE_VERT", function(ev, data) {
    var direction;
    direction = "up";
    if (data.value < 0) {
      direction = "down";
    }
    return faye.publish("/drone/move", {
      action: direction,
      speed: normalizeSpeed(data.value)
    });
  });
  $(document).on("gamepad:RIGHT_ANALOGUE_HOR", function(ev, data) {
    var direction;
    direction = "clockwise";
    if (data.value < 0) {
      direction = "counterClockwise";
    }
    return faye.publish("/drone/move", {
      action: direction,
      speed: normalizeSpeed(data.value)
    });
  });
  gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
  if (gamepadSupportAvailable) {
    gamepad = {};
    gamepad.BUTTONS = {
      FACE_1: 0,
      FACE_2: 1,
      FACE_3: 2,
      FACE_4: 3,
      LEFT_SHOULDER: 4,
      RIGHT_SHOULDER: 5,
      LEFT_SHOULDER_BOTTOM: 6,
      RIGHT_SHOULDER_BOTTOM: 7,
      SELECT: 8,
      START: 9,
      LEFT_ANALOGUE_STICK: 10,
      RIGHT_ANALOGUE_STICK: 11,
      PAD_TOP: 12,
      PAD_BOTTOM: 13,
      PAD_LEFT: 14,
      PAD_RIGHT: 15
    };
    gamepad.AXES = {
      LEFT_ANALOGUE_HOR: 0,
      LEFT_ANALOGUE_VERT: 1,
      RIGHT_ANALOGUE_HOR: 2,
      RIGHT_ANALOGUE_VERT: 3
    };
    checkForGamePad = null;
    padStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    axesStatus = [0, 0, 0, 0];
    setupGamepad = function(pad) {
      var checkButtons, padButtonEvent;
      console.log("setting up gamepad");
      padButtonEvent = function(name, value) {
        return $(document).trigger("gamepad:" + name, [
          {
            value: value
          }
        ]);
      };
      checkButtons = function() {
        var index, name, _ref, _ref2, _results;
        pad = navigator.webkitGetGamepads()[0];
        _ref = gamepad.BUTTONS;
        for (name in _ref) {
          index = _ref[name];
          if (padStatus[index] !== pad.buttons[index]) {
            padStatus[index] = pad.buttons[index];
            padButtonEvent(name, pad.buttons[index]);
          }
        }
        _ref2 = gamepad.AXES;
        _results = [];
        for (name in _ref2) {
          index = _ref2[name];
          _results.push(0.1 < Math.abs(axesStatus[index] - pad.axes[index]) ? (axesStatus[index] = pad.axes[index], padButtonEvent(name, pad.axes[index])) : void 0);
        }
        return _results;
      };
      setInterval(checkButtons, 1000);
      return console.log("hi");
    };
    checkForGamePad = function() {
      var pad;
      pad = navigator.webkitGetGamepads()[0];
      if (pad != null) {
        console.log("found");
        return setupGamepad(pad);
      } else {
        return setTimeout(this, 1000);
      }
    };
    checkForGamePad();
  }
}).call(this);
