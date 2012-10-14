Getting started
======
Connect to your ar drone 2 via WLAN, then run node.server.js open up localhost:3001 and you're ready to go.

Use `W, A, S, D` to move front, back and sideways. Use your `cursors` to go up/down or turn clockwise/counter clockwise.
Some animations can be triggered with `1-4`
`SPACE` for taking of and `esc` for landing.

When you crash use `e` to recover from emergency mode.

This project is heavily inspired from https://github.com/usefulthink/nodecopter-monitor . I just removed the three.js part and ported it from socket.io to faye since I like that better.

Dependencies
=======
You can install/update the node dependencies via `npm install -d`.
Dependencies for client code are managed via bower ( https://github.com/twitter/bower ). 
You need to have `ffmpeg` installed (it's used for the picture stuff)

Screenshot
========
This is how it looks like in action:
![drone browser in chrome](https://raw.github.com/functino/drone-browser/master/screenshot.png)

TODO
======
- use getUserMedia/the webcam to control the drone (like magic xylophone...)
- add a slider to make the speed/duration of actions configurable
- toggle between takeoff/land buttons or disable takeoff button after takeoff...
- mayby change the "recover" button to send a land command first (because otherwise the drone tries to start again...)
- only show the recover button when the drone is in emergency mode
- use canvas to draw angle-stuff or rotate the picture stream accordingly
- get rid of the (sometimes) long lag of the picture stream 
- makte it work without ffmpeg (skip the picture stuff then....)