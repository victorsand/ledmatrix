import serial
import time

ser = serial.Serial('/dev/ttyACM0', 9600)

while True:

    ser.write('0')
    ser.write('1')
    ser.write('0')
    ser.write('0')

    time.sleep(10);

    ser.write('1')
    ser.write('0')
    ser.write('1')
    ser.write('0')

    time.sleep(10);



