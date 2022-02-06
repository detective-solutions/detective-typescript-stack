import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthService } from '@detective.solutions/detective-client/features/auth';
import { HomeContainerComponent } from './home-container.component';
import { MockProvider } from 'ng-mocks';
import { NavigationModule } from '@detective.solutions/frontend/detective-client/ui';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

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
          getTranslocoModule({ 'admin/en': en, 'admin/de': de }),
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
