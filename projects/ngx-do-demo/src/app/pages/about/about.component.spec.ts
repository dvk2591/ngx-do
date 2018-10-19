import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PagesModule} from '../pages.module';
import { AppModule} from '../../app.module';
import { APP_BASE_HREF } from '@angular/common';
import { AboutComponent } from './about.component';
import { environment } from '../../../environments/environment.spec';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        AppModule,
        PagesModule,
      ],providers: [
        {provide: 'Environment', useValue: environment },
        {provide: APP_BASE_HREF, useValue: '/'}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});