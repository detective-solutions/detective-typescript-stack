import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasefileContainerComponent } from './casefile-container.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CasefileContainerComponent', () => {
  let component: CasefileContainerComponent;
  let fixture: ComponentFixture<CasefileContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CasefileContainerComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasefileContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
