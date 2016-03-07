import serial
import sys
import re

ser = serial.Serial('/dev/ttyACM1', 9600)

if len(sys.argv) != 4:
    print "Too many arguments"
    sys.exit(1)

three_digits_regexp = '[0-7]{3}'

message_rgb = sys.argv[1]

if len(message_rgb) != 3 or not re.match(three_digits_regexp, message_rgb):
    print "Message color must consist of three RGB integers, 0-7"
    sys.exit(1)

border_rgb = sys.argv[2]

if len(border_rgb) != 3 or not re.match(three_digits_regexp, border_rgb):
    print "Border color must consist of three RGB integers, 0-7"
    sys.exit(1)

message = sys.argv[3]

if len(message) > 128:
    print "Message is too long"
    sys.exit(1)

for c in message_rgb:
    ser.write(c)

for c in border_rgb:
    ser.write(c)

for c in message:
    if ord(c) < 0 or ord(c) > 255:
        print "Character not allowed"
        sys.exit(1)
    ser.write(c)

ser.write('\0')
