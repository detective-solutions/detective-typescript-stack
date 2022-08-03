import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  setData(input: any): void {
    console.log(input);
  }
}
