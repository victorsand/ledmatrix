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

const char message_0[] PROGMEM = "Hello";
const char message_1[] PROGMEM = "OK!";
const char message_2[] PROGMEM = "Some really long string that would not fit in SRAM";

const char* const message_table[] PROGMEM = {
  message_0,
  message_1,
  message_2
};

const int strlen_table[] = {
  strlen_P(message_0),
  strlen_P(message_1),
  strlen_P(message_2)
};

elapsedMillis time_elapsed = 0;

int message_index;
char character;

int message_length;
int message_offset_x;
int min_offset_x;

void selectMessage(int index) {
  message_index = index;
  message_length = strlen_table[message_index];
  min_offset_x = message_length * TEXT_WIDTH * -1;
}

void drawBorder(int color) {
  matrix.drawLine(0, 0, WIDTH-1, 0, color);
  matrix.drawLine(0, 0, 0, HEIGHT-1, color);
  matrix.drawLine(0, HEIGHT-1, WIDTH-1, HEIGHT-1, color);
  matrix.drawLine(WIDTH-1, 0, WIDTH-1, HEIGHT-1, color);
}

void printMessage(int offsetX, int color) {
  matrix.setTextColor(color);
  matrix.setCursor(offsetX, 4);
  PGM_P prog_ptr = (prog_char*)pgm_read_word(&message_table[message_index]);
  for (int i=0; i<message_length; i++) {
    character = (char)pgm_read_byte(&prog_ptr[i]);
    matrix.print(character);
  }
}

void setup() {
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setTextSize(TEXT_SIZE);
  
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

void loop() {
  selectMessage(0);
  matrix.fillScreen(0);
  updateScroll();
  printMessage(message_offset_x, matrix.Color333(5, 5, 5));
  drawBorder(matrix.Color333(7, 0, 0));
  matrix.swapBuffers(false);
}
