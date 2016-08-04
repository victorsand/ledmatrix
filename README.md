# LED MATRIX

Display messages from a web server on an LED matrix, which is controlled by an Arduino Uno.

## Install

### Dependencies

Install Arduino dependencies. The libraries go either in the sketchbook folder (which can be set from the IDE preferences) or the Arduino folder, like below. Make sure to adjust folder name as necessary.

```
git clone https://github.com/adafruit/RGB-matrix-Panel.git /opt/arduino-1.6.10/libraries/RGBLEDMatrix && 
git clone https://github.com/adafruit/Adafruit-GFX-Library.git /opt/arduino-1.6.10/libraries/Adafruit_GFX &&
git clone https://github.com/pfeerick/elapsedMillis.git /opt/arduino-1.6.10/libraries/elapsedMillis
```

Download and install the PySerial library:
[https://sourceforge.net/projects/pyserial/](https://sourceforge.net/projects/pyserial)

## Wiring

Use the excellent wiring instructions from Adafruit:
[https://learn.adafruit.com/32x16-32x32-rgb-led-matrix](https://learn.adafruit.com/32x16-32x32-rgb-led-matrix)
