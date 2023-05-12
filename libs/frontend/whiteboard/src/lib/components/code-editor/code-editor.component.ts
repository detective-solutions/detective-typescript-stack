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

  editorWidth = 700;
  offsetX = 0;

  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  private readonly options = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: "'Roboto Mono Regular', monospace",
  };

  ngAfterViewInit() {
    this.initEditor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.editor) {
      return;
    }
    for (const propName in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, propName)) {
        switch (propName) {
          case 'text':
            this.onExternalUpdate();
            break;
          case 'mode':
            this.onEditorModeChange();
            break;
          default:
        }
      }
    }
  }

  onTextChange(text: string) {
    this.textChange.emit(text);
  }

  toggleVisibility() {
    this.editorArrowEvent.emit({ editorState: false });
  }

  sendQuery() {
    console.log('Sent');
  }

  private initEditor() {
    this.editor = edit(this.editorRef.nativeElement);
    this.editor.setOptions(this.options);
    this.editor.setValue(this.text, -1);
    this.editor.setReadOnly(this.readOnly);
    this.setEditorMode();
    this.editor.session.setUseWorker(false);
    this.editor.on('change', () => this.onEditorTextChange());
  }

  private onExternalUpdate() {
    this.editor.setValue(this.text, -1);
    this.editor.moveCursorToPosition(this.editor.getCursorPosition());
  }

  private onEditorTextChange() {
    this.text = this.editor.getValue();
    this.onTextChange(this.text);
  }

  private onEditorModeChange() {
    this.setEditorMode();
  }

  private setEditorMode() {
    this.editor.getSession().setMode(`ace/mode/${this.mode}`);
  }
}
