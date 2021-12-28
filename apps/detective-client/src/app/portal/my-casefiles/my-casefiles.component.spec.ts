import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCasefilesComponent } from './my-casefiles.component';

describe('MyCasefilesComponent', () => {
  let component: MyCasefilesComponent;
  let fixture: ComponentFixture<MyCasefilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyCasefilesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCasefilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
