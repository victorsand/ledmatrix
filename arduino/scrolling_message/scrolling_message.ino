#include <avr/pgmspace.h>
#include <Adafruit_GFX.h>
#include <RGBmatrixPanel.h>
#include <elapsedMillis.h>

#define CLK 11  // MUST be on PORTB! (Use pin 11 on Mega)
#define LAT A3
#define OE  9
#define A   A0
#define B   A1
#define C   A2
RGBmatrixPanel matrix(A, B, C, CLK, LAT, OE, true);

const int WIDTH = 32;
const int HEIGHT = 16;
const int TEXT_SIZE = 1;
const int TEXT_WIDTH = 6; // width of font + one whitespace
const int MESSAGE_BUFFER_LENGTH = 512;
const int SERIAL_DELAY = 50;
const int BAUD_RATE = 9600;
const int MODE_DEFAULT = 0;
const int MODE_SCROLLING = 1;

int display_mode;

int draw_delay;

char message_buffer[MESSAGE_BUFFER_LENGTH];

const int COLOR_R = 0;
const int COLOR_G = 1;
const int COLOR_B = 2;

const int MAX_ANIMATION_INTENSITY = 7;

int animation_buffer[WIDTH * HEIGHT * 3];

int message_length;
int message_offset_x;
int min_offset_x;

elapsedMillis time_elapsed = 0;

int border_r;
int border_g;
int border_b;

int message_r;
int message_g;
int message_b;

void setDisplayMode(int mode) {
  display_mode = mode;
  if (mode == MODE_DEFAULT) {
    initAnimation();
    draw_delay = 200;
  }
}

void drawBorder() {
  int color = matrix.Color333(border_r, border_g, border_b);
  matrix.drawLine(0, 0, WIDTH-1, 0, color);
  matrix.drawLine(0, 0, 0, HEIGHT-1, color);
  matrix.drawLine(0, HEIGHT-1, WIDTH-1, HEIGHT-1, color);
  matrix.drawLine(WIDTH-1, 0, WIDTH-1, HEIGHT-1, color);
}

void drawMessage() { 
  matrix.setTextColor(matrix.Color333(message_r, message_g, message_b));
  matrix.setCursor(message_offset_x, 4);
  char character;
  for (int i=0; i<message_length; i++) {
    character = message_buffer[i];
    matrix.print(character);
  }
}

void initMessageAndColors() {
  message_buffer[0] = '?';
  message_length = 1;
  updateMinOffsetX();
  message_r = 3;
  message_g = 3;
  message_b = 3;
  border_r = 0;
  border_g = 3;
  border_b = 0;
}

void resetScroll() {
  time_elapsed = 0;
  message_offset_x = WIDTH;  
  draw_delay = 150;
}

void updateMinOffsetX() {
  min_offset_x = message_length * TEXT_WIDTH * -1;
}

int readNextSerialInput() {
  return Serial.read() - '0';
}

void readSerial() {
  if (Serial.available()) {
    int mode = readNextSerialInput();
    delay(SERIAL_DELAY);
    setDisplayMode(mode);
    if (display_mode == MODE_DEFAULT) {
      // no more params
    } else if (display_mode == MODE_SCROLLING) {
      message_r = readNextSerialInput();
      delay(SERIAL_DELAY);
      message_g = readNextSerialInput();
      delay(SERIAL_DELAY);
      message_b = readNextSerialInput();
      delay(SERIAL_DELAY);
      border_r = readNextSerialInput();
      delay(SERIAL_DELAY);
      border_g = readNextSerialInput();
      delay(SERIAL_DELAY);
      border_b = readNextSerialInput();
      delay(SERIAL_DELAY);
      message_length = Serial.readBytesUntil('\0', message_buffer, MESSAGE_BUFFER_LENGTH);
      updateMinOffsetX();
      resetScroll();
    }    
  }  
}

int matrixIndex(int x, int y, int color_index) {
  return x*3 + y*WIDTH*3 + color_index;
}

void initAnimation() {
  for (int i=0; i<WIDTH*HEIGHT; i++) {
    animation_buffer[i + COLOR_R] = 0;
    animation_buffer[i + COLOR_G] = 0;
    animation_buffer[i + COLOR_B] = 0;
  }
  initAnimationTopRow();
}

void initAnimationTopRow() {
  int color_r, color_g, color_b;
  for (int x=0; x<WIDTH; x++) {
    if (animation_buffer[matrixIndex(x, 0, COLOR_R)] == 0 &&
      animation_buffer[matrixIndex(x, 0, COLOR_G)] == 0 &&
      animation_buffer[matrixIndex(x, 0, COLOR_B)] == 0) {
      color_r = 0;
      color_g = 0;
      color_b = 0;
      if (random(0, 20) == 1) {
        color_r = color_b = random(MAX_ANIMATION_INTENSITY);
        color_g = random(color_r, MAX_ANIMATION_INTENSITY);
      }
      animation_buffer[matrixIndex(x, 0, COLOR_R)] = color_r;
      animation_buffer[matrixIndex(x, 0, COLOR_G)] = color_g;
      animation_buffer[matrixIndex(x, 0, COLOR_B)] = color_b;
    }
  } 
}

void updateScroll() {
  if (time_elapsed > draw_delay) {
    message_offset_x = max(--message_offset_x, min_offset_x);
    time_elapsed = 0;
  }
}

void updateAnimation() {
   if (time_elapsed <= draw_delay) {
     return;  
  } 
  time_elapsed = 0;
  int color_above_r, color_above_g, color_above_b;
  int new_color_r, new_color_g, new_color_b;
  for (int y=HEIGHT-1; y>0; y--) {
    for (int x=0; x<WIDTH; x++) {
      color_above_r = animation_buffer[matrixIndex(x, y-1, COLOR_R)];
      color_above_g = animation_buffer[matrixIndex(x, y-1, COLOR_G)];
      color_above_b = animation_buffer[matrixIndex(x, y-1, COLOR_B)];
      animation_buffer[matrixIndex(x, y, COLOR_R)] = color_above_r;
      animation_buffer[matrixIndex(x, y, COLOR_G)] = color_above_g;
      animation_buffer[matrixIndex(x, y, COLOR_B)] = color_above_b;
      new_color_r = max(color_above_r - 1, 0);
      new_color_g = max(color_above_g - 1, 0);
      new_color_b = max(color_above_b - 1, 0);
      animation_buffer[matrixIndex(x, y-1, COLOR_R)] = new_color_r;
      animation_buffer[matrixIndex(x, y-1, COLOR_G)] = new_color_g;
      animation_buffer[matrixIndex(x, y-1, COLOR_B)] = new_color_b;
    }
  }
  initAnimationTopRow();
}

void drawAnimation() {
  for (int y=0; y<HEIGHT; y++) {
    for (int x=0; x<WIDTH; x++) {
      int color = matrix.Color333(
        animation_buffer[matrixIndex(x, y, COLOR_R)],
        animation_buffer[matrixIndex(x, y, COLOR_G)],
        animation_buffer[matrixIndex(x, y, COLOR_B)]  
      );
      matrix.drawPixel(x, y, color);
    }
  }
}

void setup() {
  delay(1000);
  randomSeed(analogRead(0));
  setDisplayMode(MODE_DEFAULT);
  initMessageAndColors();
  Serial.begin(BAUD_RATE);
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setTextSize(TEXT_SIZE);   
}

void loop() {
  matrix.fillScreen(0);
  readSerial();
  if (display_mode == MODE_DEFAULT) {
    updateAnimation();
    drawAnimation();
  } else if (display_mode == MODE_SCROLLING) {
    updateScroll();
    drawMessage();
    drawBorder();
  }
  matrix.swapBuffers(false);
}

