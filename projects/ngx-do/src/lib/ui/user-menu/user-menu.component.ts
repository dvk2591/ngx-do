import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { CoreAuth } from '../../core/core.auth';
import { Router} from '@angular/router';

@Component({
  selector: 'ngx-do-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
	isOpen = false;

  	@Input() currentUser;
    @Input() settingsRoute;
    @Input() profileRoute;
    @Input() helpRoute;
    @Input() securityRoute;
    @Input() logoutRoute =  '/logout';


  	constructor(private elementRef: ElementRef, private router: Router,
                private coreAuth: CoreAuth) { }

  	@HostListener('document:click', ['$event', '$event.target'])
  	onClick(event: MouseEvent, targetElement: HTMLElement) {
    	if (!targetElement) {
     		return;
    	}

    	const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    	if (!clickedInside) {
      		this.isOpen = false;
    	}
  	}

    close() {
      this.isOpen = false;
    }

  	ngOnInit() {
  	}

    logout() {
      this.coreAuth.logout(true);
      this.router.navigate([this.logoutRoute || '/logout']);
    }

}
