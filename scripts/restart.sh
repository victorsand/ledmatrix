#! /bin/bash

echo ----- Killing server processes...
killall node

echo ----- Reuploading .ino file to Arduino board...
/opt/arduino-1.6.10/arduino --upload /home/matrix/code/ledmatrix/arduino/scrolling_message/scrolling_message.ino --port /dev/ttyACM0 --board arduino:avr:mega:cpu=atmega2560

sleep 5s

echo ----- Restarting server...
node /home/matrix/code/ledmatrix/pi-server/server.js &

echo ----- Done!
