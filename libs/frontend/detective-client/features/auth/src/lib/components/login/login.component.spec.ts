import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '../../..';
import { LoginComponent } from './login.component';
import { MockProvider } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../../i18n/de.json';
import en from '../../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, getTranslocoModule({ 'auth/en': en, 'auth/de': de })],
      providers: [MockProvider(AuthService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
