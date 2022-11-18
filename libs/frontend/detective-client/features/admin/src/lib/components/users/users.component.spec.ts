import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { GetAllUserGroupsGQL } from '../../graphql';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';
import { UsersComponent } from './users.component';
import { UsersService } from '../../services';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [UsersComponent],
      providers: [MockService(UsersService), GetAllUserGroupsGQL, Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
