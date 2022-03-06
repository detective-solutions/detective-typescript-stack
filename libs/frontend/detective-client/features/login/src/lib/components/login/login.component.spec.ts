import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '@detective.solutions/detective-client/features/auth';
import { LoginComponent } from './login.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MockProvider } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../../i18n/de.json';
import en from '../../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

const materialModules = [MatCardModule, MatIconModule, MatFormFieldModule];

xdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        getTranslocoModule({ 'login/en': en, 'login/de': de }),
        ...materialModules,
      ],
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
