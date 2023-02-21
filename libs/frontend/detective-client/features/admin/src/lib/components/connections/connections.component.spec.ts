import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService, ngMocks } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { CatalogService } from '../../services';
import { ConnectionsComponent } from './connections.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('ConnectionsComponent', () => {
  let component: ConnectionsComponent;
  let fixture: ComponentFixture<ConnectionsComponent>;

  ngMocks.faster();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [ConnectionsComponent],
      providers: [MockService(CatalogService), Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
