import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCasefilesComponent } from './all-casefiles.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AllCasefilesComponent', () => {
  let component: AllCasefilesComponent;
  let fixture: ComponentFixture<AllCasefilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllCasefilesComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllCasefilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
