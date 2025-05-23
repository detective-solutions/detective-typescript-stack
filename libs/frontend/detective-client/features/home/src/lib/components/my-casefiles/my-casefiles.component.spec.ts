import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, ngMocks } from 'ng-mocks';
import { TableCellEventService, TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { Apollo } from 'apollo-angular';
import { MyCasefilesComponent } from './my-casefiles.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('MyCasefilesComponent', () => {
  let component: MyCasefilesComponent;
  let fixture: ComponentFixture<MyCasefilesComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RouterTestingModule, MockModule(TableModule), MockModule(TilesModule)],
      declarations: [MyCasefilesComponent],
      providers: [Apollo, TableCellEventService],
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
