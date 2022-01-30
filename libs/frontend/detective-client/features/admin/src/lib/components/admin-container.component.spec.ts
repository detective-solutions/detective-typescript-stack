import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContainerComponent } from './admin-container.component';
import { NavigationModule } from '@detective.solutions/frontend/detective-client/ui';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import { getTranslocoModule } from '@detective.solutions/shared/i18n';

describe('AdminContainerComponent', () => {
  let component: AdminContainerComponent;
  let fixture: ComponentFixture<AdminContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminContainerComponent],
      imports: [
        NavigationModule,
        RouterTestingModule,
        NoopAnimationsModule,
        getTranslocoModule({ 'admin/en': en, 'admin/de': de }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
