faye = new Faye.Client "/faye", timeout: 120

faye.subscribe "/drone/navdata",  (data) ->
  ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", 
  "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach (type) ->
    $("#" + type).html(Math.round(data.demo[type], 4))    
  #$("#cam").css("-webkit-transform": "rotate(" + data.demo.leftRightDegrees + "deg)")
  showBatteryStatus(data.demo.batteryPercentage)

window.showBatteryStatus = (batteryPercentage) ->
  $("#batterybar").width("" + batteryPercentage + "%")
  if batteryPercentage < 30
    $("#batteryProgress").removeClass("progress-success").addClass("progress-warning")
  if batteryPercentage < 15
    $("#batteryProgress").removeClass("progress-warning").addClass("progress-danger")    
  $("#batteryProgress").attr("data-original-title": "Battery status: " + batteryPercentage + "%")

faye.subscribe "/drone/image", (src) -> $("#cam").attr(src: src)

keymap =
  87 : { ev: 'move', action: 'front' }, # W
  83 : { ev: 'move', action: 'back' }, # S
  65 : { ev: 'move', action: 'left' }, # A
  68 : { ev: 'move', action: 'right' }, # D
  38 : { ev: 'move', action: 'up' }, # up
  40 : { ev: 'move', action: 'down' }, # down
  37 : { ev: 'move', action: 'counterClockwise' }, # left
  39 : { ev: 'move', action: 'clockwise' }, # right
  32 : { ev: 'drone', action: 'takeoff' }, # space
  27 : { ev: 'drone', action: 'land' },  # esc
  49 : { ev: 'animate', action: 'flipAhead', duration: 15 }, # 1
  50 : { ev: 'animate', action: 'flipLeft', duration: 15 }, # 2
  51 : { ev: 'animate', action: 'yawShake', duration: 15 }, # 3
  52 : { ev: 'animate', action: 'doublePhiThetaMixed', duration: 15 }, # 4
  53 : { ev: 'animate', action: 'wave', duration: 15 }, # 5
  69 : { ev: 'drone', action: 'disableEmergency'} # E
speed = 0
$(document).keydown (ev) ->
  return unless keymap[ev.keyCode]?
  ev.preventDefault()

  speed = if speed >= 1 then 1 else speed + 0.08 / (1 - speed)

  evData = keymap[ev.keyCode]
  faye.publish "/drone/" + evData.ev, action: evData.action, speed: speed, duration: evData.duration

$(document).keyup (ev) ->
  speed = 0
  faye.publish "/drone/drone", { action: 'stop' }

$("*[data-action]").on "mousedown", (ev) ->
  faye.publish "/drone/" + $(@).attr("data-action"), action: $(@).attr("data-param"), speed: 0.3, duration: 1000*parseInt($("#duration").val())

$("*[data-action]").on "mouseup", (ev) ->
  faye.publish "/drone/move", action: $(@).attr("data-param"), speed: 0 if $(@).attr("data-action") == "move"

$("*[rel=tooltip]").tooltip();