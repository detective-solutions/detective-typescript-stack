import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationComponent } from './navigation.component';
import { NavigationMaterialModule } from './navigation.material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavigationMaterialModule,
        NoopAnimationsModule,
        RouterTestingModule,
        getTranslocoModule({ 'navigation/en': en, 'navigation/de': de }),
      ],
      declarations: [NavigationComponent],
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
