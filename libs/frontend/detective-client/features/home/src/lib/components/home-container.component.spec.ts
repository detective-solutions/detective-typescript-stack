import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { HomeContainerComponent } from './home-container.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MockProvider } from 'ng-mocks';
import { NavigationModule } from '@detective.solutions/frontend/detective-client/ui';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

const materialModules = [MatSnackBarModule];

describe('HomeContainerComponent', () => {
  let component: HomeContainerComponent;
  let fixture: ComponentFixture<HomeContainerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          NavigationModule,
          RouterTestingModule,
          NoopAnimationsModule,
          HttpClientTestingModule,
          getTranslocoModule({ 'admin/en': en, 'admin/de': de }),
          ...materialModules,
        ],
        providers: [MockProvider(AuthService)],
        declarations: [HomeContainerComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
