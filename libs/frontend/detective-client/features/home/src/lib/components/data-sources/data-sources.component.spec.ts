import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, ngMocks } from 'ng-mocks';
import { TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { Apollo } from 'apollo-angular';
import { DataSourceService } from '../../services/data-source.service';
import { DataSourcesComponent } from './data-sources.component';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllDataSourcesGQL } from '../../graphql/get-all-data-sources-gql';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('DataSourcesComponent', () => {
  let component: DataSourcesComponent;
  let fixture: ComponentFixture<DataSourcesComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RouterTestingModule, MockModule(TableModule), MockModule(TilesModule)],
      declarations: [DataSourcesComponent],
      providers: [DataSourceService, Apollo, GetAllDataSourcesGQL, EventService],
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
