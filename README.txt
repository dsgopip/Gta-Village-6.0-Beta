VILLAGE LIFE 3D — VERSION 6.0

UPDATE:
- Camera has its own touch-look area on the right side of the screen. Drag inside it to rotate the view; it does not move the character or steer the car.
- Walking joystick is corrected: push up = move forward, down = move backward, left/right = strafe. Direction is relative to the camera.
- Vehicle steering joystick and separate forward/reverse pedals remain separate.
- All PNG textures are embedded into textures-inline.js as data URLs. The game no longer requests a /textures folder, so GitHub's folder-upload problem is avoided.

GITHUB PAGES UPDATE:
1. Extract this ZIP.
2. Upload all files inside VILLAGE_LIFE_3D_V3 to the ROOT of your existing repository.
3. Replace old files when GitHub asks. Upload textures-inline.js too.
4. You do NOT need to upload the textures folder. The PNGs are embedded in textures-inline.js.
5. Commit changes, then open the GitHub Pages site and refresh it.

CONTROLS:
Walking: joystick up/down = forward/back, left/right = strafe; RUN for faster movement.
Camera: drag the separate outlined touch area on the right side.
Car: left joystick = steering; FORWARD and BACK are separate pedals.
CAMERA button switches first-person/third-person view.

NOTES:
- Three.js is loaded from jsDelivr CDN, so an internet connection is required.
- This remains a browser-based low-poly prototype, not a full commercial driving simulator.
