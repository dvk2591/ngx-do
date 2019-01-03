import { Component, OnInit, Input } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import { CoreAuth} from '../core.auth';
import { Observable,from } from 'rxjs';

@Component({
    selector: 'cdk-sidemenu-item',
    templateUrl: './sidemenu-item.component.html',
    styleUrls: ['./sidemenu-item.component.theme.scss']
})
export class SidemenuItemComponent implements OnInit {

    @Input() menu;
    @Input() iconOnly: boolean;
    @Input() secondaryMenu = false;
    @Input() onSelectedMenu
    visibleRole : boolean = true;

    constructor(private coreAuth:CoreAuth,private router:Router,private route:ActivatedRoute) { }

    ngOnInit() {
      let role = this.menu ? this.menu.expectedRole: null;
      //Check if the role is protected by path
      if (role==null && this.menu && this.menu.link) { 
        var routerRole = function(routes,link){
          let links = link.split('/').splice(0,1);
          let path = links[0];
          routes.forEach(function(route) {
            if (route['path']==links[0] || route['path']=='/'+links[0] ){
              if (route['data'] && route['data']['expextedRole']) 
                role=route['data']['expextedRole'];
            }
            let childLink = links.splice(0,1); //Remove the parent
            if (route['children']) 
              routerRole(route['children'],childLink.join('/'));
          });
        }
        routerRole(this.router.config,this.menu.link);
      }
      this.coreAuth.hasRole(role).then(state=>{
        this.visibleRole=state;
      })
    }

    clickLink(menu,event){
      if (!(menu.link==false)) {
        if (menu.link instanceof Function) {
          menu.link() 
        } else if (menu.link.indexOf('/')==0) {
          this.router.navigate([menu.link]);
        } else {
          this.router.navigate([menu.link],{relativeTo:this.route})
        }
      } else {
         menu.open = !menu.open;
      }
      if (this.onSelectedMenu instanceof Function)
        this.onSelectedMenu(menu);
    }

   clickMenu(menu,event){
     if (menu.sub) menu.open = !menu.open;
     event.stopPropagation(); //Only drop down or close
     return false;
   }

    checkForChildMenu() {
        return (this.menu && this.menu.sub) ? true : false;
    }
  
  
   public isVisible(){
     if (!this.menu) return false;   
     if (typeof(this.menu.visible)=='function') return this.visibleRole && this.menu.visible() ;
     return this.visibleRole && this.menu.visible!==false;
   }
  
   public chipValue(){
     if (!this.menu) return 0;
     if (this.menu.chip && typeof(this.menu.chip.value)=='function') 
       return this.menu.chip.value();
     return this.menu.chip.value || 0;
   }

}
