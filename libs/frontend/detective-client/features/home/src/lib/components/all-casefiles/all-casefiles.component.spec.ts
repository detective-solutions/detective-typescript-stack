import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, ngMocks } from 'ng-mocks';
import { TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { AllCasefilesComponent } from './all-casefiles.component';
import { Apollo } from 'apollo-angular';
import { CasefileService } from '../../services/casefile.service';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL } from '../../graphql/get-all-casefiles-gql';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('AllCasefilesComponent', () => {
  let component: AllCasefilesComponent;
  let fixture: ComponentFixture<AllCasefilesComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RouterTestingModule, MockModule(TableModule), MockModule(TilesModule)],
      declarations: [AllCasefilesComponent],
      providers: [CasefileService, Apollo, GetAllCasefilesGQL, EventService],
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
