import { Injectable } from '@angular/core';
import { WindowGlobals } from '../interfaces';

declare let window: WindowGlobals;

enum KeyboardCodes {
  SPACE = 'Space',
}

@Injectable({ providedIn: 'root' })
export class KeyboardService {
  constructor() {
    window.isSpacebarPressed = false;

    window.onkeydown = (event: KeyboardEvent) => {
      if (event.code === KeyboardCodes.SPACE) {
        window.isSpacebarPressed = true;
      }
    };
    window.onkeyup = (event: KeyboardEvent) => {
      if (event.code === KeyboardCodes.SPACE) {
        window.isSpacebarPressed = false;
      }
    };
  }
}
