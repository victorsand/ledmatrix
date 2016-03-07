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
const int DRAW_DELAY = 100; // milliseconds
const int MESSAGE_BUFFER_LENGTH = 128;
const int BAUD_RATE = 9600;

char message_buffer[MESSAGE_BUFFER_LENGTH];

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
  int message_length = MESSAGE_BUFFER_LENGTH;
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

void updateScroll() {
  if (time_elapsed > DRAW_DELAY) {
    message_offset_x--;
    if (message_offset_x < min_offset_x) {
      message_offset_x = WIDTH;
    }
    time_elapsed = 0;
  }
}

void resetScroll() {
  time_elapsed = 0;
  message_offset_x = WIDTH;  
}

void updateMinOffsetX() {
  min_offset_x = message_length * TEXT_WIDTH * -1;
}

void readSerial() {
  if (Serial.available()) {
    message_r = Serial.read() - '0';
    delay(100);
    message_g = Serial.read() - '0';
    delay(100);
    message_b = Serial.read() - '0';
    delay(100);
    border_r = Serial.read() - '0';
    delay(100);
    border_g = Serial.read() - '0';
    delay(100);
    border_b = Serial.read() - '0';
    message_length = Serial.readBytesUntil('\0', message_buffer, MESSAGE_BUFFER_LENGTH);
    updateMinOffsetX();
    resetScroll();
  }  
}

void setup() {
  delay(1000);
  initMessageAndColors();
  Serial.begin(BAUD_RATE);
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setTextSize(TEXT_SIZE);   
}

void loop() {
  matrix.fillScreen(0);
  readSerial();
  updateScroll();
  drawMessage();
  drawBorder();
  matrix.swapBuffers(false);
}

