import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MockProvider } from 'ng-mocks';
import { NavigationComponent } from './navigation.component';
import { NavigationEventService } from '../services';
import { NavigationMaterialModule } from '../navigation.material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../../i18n/de.json';
import en from '../../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

const materialModules = [MatSnackBarModule, MatDialogModule];

xdescribe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavigationMaterialModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        getTranslocoModule({ 'navigation/en': en, 'navigation/de': de }),
        ...materialModules,
      ],
      declarations: [NavigationComponent],
      providers: [NavigationEventService, MockProvider(AuthService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    component.sidenavItems = [];
    component.sidenavBottomItem = { icon: '', translationKey: '', route: '', title: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
