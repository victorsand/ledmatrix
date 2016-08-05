#! /bin/bash

echo ----- Killing server processes...
killall node

echo ----- Reuploading .ino file to Arduino board...
/opt/arduino-1.6.10/arduino --upload /home/matrix/code/ledmatrix/arduino/scrolling_message/scrolling_message.ino --port /dev/ttyACM0 --board arduino:avr:mega:cpu=atmega2560

echo ----- Testing...
python /home/matrix/code/ledmatrix/pi-master/scrolling_message.py -scroll 056 550 Greetings

sleep 7s

echo ----- Restarting server...
node /home/matrix/code/ledmatrix/pi-server/server.js &

echo ----- Done!


