express = require "express"
faye = require "faye"
path = require "path"
drone = require("ar-drone").createClient()
drone.config('general:navdata_demo', 'TRUE');

app = express()
app.configure ->
  app.set('port', process.env.PORT || 3001)
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
  app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')))
server = require("http").createServer(app)

new faye.NodeAdapter(mount: '/faye', timeout: 45).attach(server)
socket = new faye.Client("http://localhost:#{app.get("port")}/faye")

socket.subscribe "/drone/move", (cmd) ->
  console.log("move", cmd)
  drone[cmd.action]?(cmd.speed)

socket.subscribe "/drone/animate", (cmd) ->
  console.log('animate', cmd)
  drone.animate(cmd.action, cmd.duration)

socket.subscribe "/drone/drone", (cmd) ->
  console.log('drone command: ', cmd)
  drone[cmd.action]?()

server.listen app.get("port"), ->
  console.log("Express server listening on port " + app.get("port"))

currentImg = null
drone.on 'navdata', (data) ->
  socket.publish "/drone/navdata", data

imageSendingPaused = false
drone.createPngStream().on "data", (frame) ->
  currentImg = frame
  return if imageSendingPaused
  socket.publish("/drone/image", "/image/#{Math.random()}")
  imageSendingPaused = true;
  setTimeout( ( -> imageSendingPaused = false ), 100)

app.get "/image/:id", (req, res) ->
  res.writeHead(200, "Content-Type": "image/png")
  res.end(currentImg, "binary")

app.get "/terminal/:action/:speed" , (req, res) ->

  action = req.param('action')
  speed = req.param('speed')
  action_list = ['takeoff', 'front', 'back', 'up', 'down', 'left', 'right', 'clockwise', 'counterClockwise', 'land']

  if(action in action_list && speed < 1 && speed > 0)
    drone[action]?(speed)
    console.log("action:" + action + ", speed " + speed)
    res.end()
  else
    console.log("Check if your command is right or not, and the speed should be between 1 and 0.")
    res.end()
