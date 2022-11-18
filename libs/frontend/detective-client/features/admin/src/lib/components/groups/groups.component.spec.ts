import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { GetAllUserGroupsGQL } from '../../graphql';
import { GroupsComponent } from './groups.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';
import { UsersService } from '../../services';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [GroupsComponent],
      providers: [MockService(UsersService), GetAllUserGroupsGQL, Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
