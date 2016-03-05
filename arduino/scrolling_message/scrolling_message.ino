#include <avr/pgmspace.h>

#include <Adafruit_GFX.h>
#include <RGBmatrixPanel.h>
#include <elapsedMillis.h>

#define CLK 8  // MUST be on PORTB! (Use pin 11 on Mega)
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

const char message[] PROGMEM = "Scrolling message with border;
int messageLength = strlen_P(message);
char c;

int messageOffsetX = WIDTH;
int minOffsetX = messageLength * TEXT_WIDTH * -1;

elapsedMillis timeElapsed = 0;

void drawBorder(int color) {
  matrix.drawLine(0, 0, WIDTH-1, 0, color);
  matrix.drawLine(0, 0, 0, HEIGHT-1, color);
  matrix.drawLine(0, HEIGHT-1, WIDTH-1, HEIGHT-1, color);
  matrix.drawLine(WIDTH-1, 0, WIDTH-1, HEIGHT-1, color);
}

void printMessage(int offsetX, int color) {
  matrix.setTextColor(color);
  matrix.setCursor(offsetX, 4);
  for (int i=0; i<messageLength; i++) {
    c = pgm_read_byte_near(message + i);
    matrix.print(c);
  }
}

void setup() {
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setTextSize(TEXT_SIZE);
}

void loop() {
  matrix.fillScreen(0);
  if (timeElapsed > DRAW_DELAY) {
      messageOffsetX--;
      if (messageOffsetX < minOffsetX) messageOffsetX = WIDTH;
      timeElapsed = 0;
  }
  printMessage(messageOffsetX, matrix.Color333(5, 5, 5));
  drawBorder(matrix.Color333(5, 0, 0));
  matrix.swapBuffers(false);
}
