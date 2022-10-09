/* eslint-disable sort-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService, ngMocks } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { GetAllMaskingsGQL } from '../../graphql';
import { MaskingsService } from '../../services';
import { MasksComponent } from './masks.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('MasksComponent', () => {
  let component: MasksComponent;
  let fixture: ComponentFixture<MasksComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [MasksComponent],
      providers: [MockService(MaskingsService), GetAllMaskingsGQL, Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
