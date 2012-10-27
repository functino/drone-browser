(function() {
  var axesStatus, checkButtons, checkForGamePad, listeners, padStatus, setupGamepad;
  listeners = {};
  window.gamepad = {
    isSupported: function() {
      return !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
    },
    BUTTONS: {
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
      LEFT_STICK: 10,
      RIGHT_STICK: 11,
      PAD_TOP: 12,
      PAD_BOTTOM: 13,
      PAD_LEFT: 14,
      PAD_RIGHT: 15
    },
    AXES: {
      LEFT_STICK_HOR: 0,
      LEFT_STICK_VERT: 1,
      RIGHT_STICK_HOR: 2,
      RIGHT_STICK_VERT: 3
    },
    on: function(event, callback) {
      var _ref;
            if ((_ref = listeners[event]) != null) {
        _ref;
      } else {
        listeners[event] = [];
      };
      return listeners[event].push(callback);
    },
    fire: function(event, value) {
      var callback, _i, _len, _ref, _results;
      if (listeners[event] == null) {
        return;
      }
      _ref = listeners[event];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback({
          value: value,
          event: event
        }));
      }
      return _results;
    }
  };
  checkForGamePad = null;
  padStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  axesStatus = [0, 0, 0, 0];
  setupGamepad = function(pad) {
    console.log("setting up gamepad");
    requestAnimationFrame(checkButtons);
    return gamepad.fire("ready", {});
  };
  checkButtons = function() {
    var index, name, pad, _ref, _ref2;
    pad = navigator.webkitGetGamepads()[0];
    _ref = gamepad.BUTTONS;
    for (name in _ref) {
      index = _ref[name];
      if (padStatus[index] !== pad.buttons[index]) {
        padStatus[index] = pad.buttons[index];
        gamepad.fire(name, pad.buttons[index]);
      }
    }
    _ref2 = gamepad.AXES;
    for (name in _ref2) {
      index = _ref2[name];
      if (0.1 < Math.abs(axesStatus[index] - pad.axes[index])) {
        axesStatus[index] = pad.axes[index];
        gamepad.fire(name, pad.axes[index]);
      }
    }
    return requestAnimationFrame(checkButtons);
  };
  checkForGamePad = function() {
    var pad;
    pad = navigator.webkitGetGamepads()[0];
    if (pad != null) {
      return setupGamepad(pad);
    } else {
      return setTimeout(checkForGamePad, 1000);
    }
  };
  gamepad.init = function(callback) {
    if (callback != null) {
      gamepad.on("ready", callback);
    }
    return checkForGamePad();
  };
}).call(this);
