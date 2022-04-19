import { Injectable } from '@angular/core';

enum KeyboardCodes {
  SPACE = 'Space',
}

@Injectable({ providedIn: 'root' })
export class KeyboardService {
  isSpaceKeyPressed = false;

  constructor() {
    window.onkeydown = (event: KeyboardEvent) => {
      if (event.code === KeyboardCodes.SPACE) {
        this.isSpaceKeyPressed = true;
      }
    };
    window.onkeyup = (event: KeyboardEvent) => {
      if (event.code === KeyboardCodes.SPACE) {
        this.isSpaceKeyPressed = false;
      }
    };
  }
}
