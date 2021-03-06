# victor.sand@gmail.com
#
# --- Scrolling message:
# scrolling_message.py -scroll [RGB message color 0-7] [RGB border color 0-7] [Message]
#
# --- Matrix animation:
# scrolling_message.py -matrix
#
# --- Usage examples
# python scrolling_message.py -scroll 500 005 "Hello world"
# python scrolling_message.py -scroll 777 777 Greetings
# python scrolling_message.py -matrix
#

import serial
import sys
import re

ser = serial.Serial('/dev/ttyACM0', 9600)

if (sys.argv[1] == "-scroll"):
    print "Scrolling message"

    if len(sys.argv) != 5:
        print "Too many arguments"
        sys.exit(1)

    three_digits_regexp = '[0-7]{3}'

    message_rgb = sys.argv[2]

    if len(message_rgb) != 3 or not re.match(three_digits_regexp, message_rgb):
        print "Message color must consist of three RGB integers, 0-7"
        sys.exit(1)

    border_rgb = sys.argv[3]

    if len(border_rgb) != 3 or not re.match(three_digits_regexp, border_rgb):
        print "Border color must consist of three RGB integers, 0-7"
        sys.exit(1)

    message = sys.argv[4]

    if len(message) > 512:
        print "Message is too long"
        sys.exit(1)

    print "[{0}]".format(message)

    # scrolling mode
    ser.write('1')

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

elif (sys.argv[1] == "-matrix"):
    print "Matrix animation"

    if len(sys.argv) != 2:
        print "Too many arguments"
        sys.exit(1)

    ser.write('0')

else:
    print "Unknown parameter"
    sys.exit(1)
