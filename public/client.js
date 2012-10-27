(function() {
  var faye, keymap, normalizeSpeed, speed;
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
    return Math.abs(val / 4);
  };
  gamepad.on("LEFT_STICK_VERT", function(data) {
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
  gamepad.on("LEFT_STICK_HOR", function(data) {
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
  gamepad.on("ready", function() {
    return console.log("ready");
  });
  if (gamepad.isSupported()) {
    gamepad.init(function() {
      return console.log("ready init?");
    });
  }
  gamepad.on("RIGHT_STICK_VERT", function(data) {
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
  gamepad.on("RIGHT_STICK_HOR", function(data) {
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
  gamepad.on("LEFT_SHOULDER", function(data) {
    return faye.publish("/drone/move", {
      action: "clockwise",
      speed: data.value
    });
  });
  gamepad.on("RIGHT_SHOULDER", function(data) {
    return faye.publish("/drone/move", {
      action: "counterClockwise",
      speed: data.value
    });
  });
  gamepad.on("LEFT_SHOULDER_BOTTOM", function(data) {
    return faye.publish("/drone/move", {
      action: "down",
      speed: data.value
    });
  });
  gamepad.on("RIGHT_SHOULDER_BOTTOM", function(data) {
    return faye.publish("/drone/move", {
      action: "up",
      speed: data.value
    });
  });
}).call(this);
