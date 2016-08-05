# LED matrix command line tool

## Scrolling message
    scrolling_message.py -scroll [RGB message color 0-7] [RGB border color 0-7] [Message]`

## Matrix animation
    scrolling_message.py -matrix`

## Usage examples
    python scrolling_message.py -scroll 500 005 "Hello world"
    python scrolling_message.py -scroll 777 777 Greetings
    python scrolling_message.py -matrix
