import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService, ngMocks } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { GetAllMaskingsGQL } from '../../graphql';
import { MaskingService } from '../../services';
import { MaskingsComponent } from './masking.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('MaskingsComponent', () => {
  let component: MaskingsComponent;
  let fixture: ComponentFixture<MaskingsComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [MaskingsComponent],
      providers: [MockService(MaskingService), GetAllMaskingsGQL, Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaskingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
