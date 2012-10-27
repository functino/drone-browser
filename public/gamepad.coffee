listeners = {}
window.gamepad = 
  isSupported: ->
    !!navigator.webkitGetGamepads || !!navigator.webkitGamepads
  BUTTONS: 
    FACE_1: 0, # Face (main) buttons
    FACE_2: 1,
    FACE_3: 2,
    FACE_4: 3,
    LEFT_SHOULDER: 4, # Top shoulder buttons
    RIGHT_SHOULDER: 5,
    LEFT_SHOULDER_BOTTOM: 6, # Bottom shoulder buttons
    RIGHT_SHOULDER_BOTTOM: 7,
    SELECT: 8,
    START: 9,
    LEFT_STICK: 10, # Analogue sticks (if depressible)
    RIGHT_STICK: 11,
    PAD_TOP: 12, # Directional (discrete) pad
    PAD_BOTTOM: 13,
    PAD_LEFT: 14,
    PAD_RIGHT: 15
  AXES:
    LEFT_STICK_HOR: 0,
    LEFT_STICK_VERT: 1,
    RIGHT_STICK_HOR: 2,
    RIGHT_STICK_VERT: 3  
  on: (event, callback) ->
    listeners[event] ?= [] 
    listeners[event].push(callback)
  fire: (event, value) ->
  	return unless listeners[event]?
  	for callback in listeners[event]
  	  callback(value: value, event: event)

checkForGamePad = null
padStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
axesStatus = [0, 0, 0, 0]
setupGamepad = (pad) ->
  console.log("setting up gamepad")
  requestAnimationFrame(checkButtons)
  gamepad.fire("ready", {})
  
checkButtons = ->
  pad = navigator.webkitGetGamepads()[0]
  for name, index of gamepad.BUTTONS
    if padStatus[index] != pad.buttons[index]
      padStatus[index] = pad.buttons[index]
      gamepad.fire(name, pad.buttons[index])
  for name, index of gamepad.AXES
    if 0.1 < Math.abs(axesStatus[index] - pad.axes[index])
      axesStatus[index] = pad.axes[index]
      gamepad.fire(name, pad.axes[index])          
  requestAnimationFrame(checkButtons)          
checkForGamePad = ->
  pad = navigator.webkitGetGamepads()[0]
  if pad?
    setupGamepad(pad)
  else
    setTimeout(checkForGamePad, 1000)

gamepad.init = (callback) -> 
  gamepad.on "ready", callback if callback?
  checkForGamePad()