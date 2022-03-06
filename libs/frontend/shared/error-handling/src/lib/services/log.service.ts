import { Injectable } from '@angular/core';

export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Error = 4,
  Off = 6,
}

@Injectable({ providedIn: 'root' })
export class LogService {
  logLevel: LogLevel = LogLevel.All;
  logWithDate = false;

  debug(message: string) {
    this.writeToLog(message, LogLevel.Debug);
  }

  info(message: string) {
    this.writeToLog(message, LogLevel.Info);
  }

  error(message: string) {
    this.writeToLog(message, LogLevel.Error);
  }

  log(message: string) {
    this.writeToLog(message, LogLevel.All);
  }

  private writeToLog(message: string, level: LogLevel) {
    if (this.shouldLog(level)) {
      const currentLogLevel = LogLevel[level];
      if (this.logWithDate) {
        console.log(`[${currentLogLevel}] - ${new Date()} - ${message}`);
      } else {
        console.log(`[${currentLogLevel}] - ${message}`);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return (level >= this.logLevel && level !== LogLevel.Off) || this.logLevel === LogLevel.All ? true : false;
  }
}
