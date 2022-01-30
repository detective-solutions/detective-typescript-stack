import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, ngMocks } from 'ng-mocks';
import { TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { DataSourceService } from '@detective.solutions/frontend/shared/data-access';
import { DataSourcesComponent } from './data-sources.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DataSourcesComponent', () => {
  let component: DataSourcesComponent;
  let fixture: ComponentFixture<DataSourcesComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MockModule(TableModule), MockModule(TilesModule)],
      declarations: [DataSourcesComponent],
      providers: [DataSourceService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
