import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, ngMocks } from 'ng-mocks';
import { TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { Apollo } from 'apollo-angular';
import { CasefileService } from '../../services/casefile.service';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL } from '../../graphql/get-all-casefiles-gql';
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
      providers: [CasefileService, Apollo, GetAllCasefilesGQL, EventService],
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
