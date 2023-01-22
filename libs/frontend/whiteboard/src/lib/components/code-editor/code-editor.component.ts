/* eslint-disable sort-imports */
import 'ace-builds/src-noconflict/theme-dracula';
import 'brace';
import 'brace/mode/sql';

import { Ace, edit } from 'ace-builds';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CdkDragMove } from '@angular/cdk/drag-drop';

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('editor') editorRef!: ElementRef;
  @Output() textChange = new EventEmitter<string>();
  @Output() editorArrowEvent = new EventEmitter();
  @Input() text!: string;
  @Input() readOnly = false;
  @Input() mode = 'sql';
  @Input() prettify = true;
  editor!: Ace.Editor;

  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: "'Roboto Mono Regular', monospace",
  };

  public editorWidth = 700;
  offsetX = 0;

  ngAfterViewInit() {
    this.initEditor_();
  }
  onTextChange(text: string): void {
    this.textChange.emit(text);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editor) {
      return;
    }
    for (const propName in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, propName)) {
        switch (propName) {
          case 'text':
            this.onExternalUpdate_();
            break;
          case 'mode':
            this.onEditorModeChange_();
            break;
          default:
        }
      }
    }
  }

  onResizeEditor(event: CdkDragMove) {
    this.editorWidth += event.pointerPosition.x;
  }

  toggleVisibility() {
    this.editorArrowEvent.emit({ editorState: false });
  }

  private initEditor_(): void {
    this.editor = edit(this.editorRef.nativeElement);
    this.editor.setOptions(this.options);
    this.editor.setValue(this.text, -1);
    this.editor.setReadOnly(this.readOnly);
    this.editor.setTheme('ace/theme/sqlserver');
    this.setEditorMode_();
    this.editor.session.setUseWorker(false);
    this.editor.on('change', () => this.onEditorTextChange_());
  }
  private onExternalUpdate_(): void {
    const point = this.editor.getCursorPosition();
    this.editor.setValue(this.text, -1);
    this.editor.moveCursorToPosition(point);
  }
  private onEditorTextChange_(): void {
    this.text = this.editor.getValue();
    this.onTextChange(this.text);
  }
  private onEditorModeChange_(): void {
    this.setEditorMode_();
  }
  private setEditorMode_(): void {
    this.editor.getSession().setMode(`ace/mode/${this.mode}`);
  }
}
