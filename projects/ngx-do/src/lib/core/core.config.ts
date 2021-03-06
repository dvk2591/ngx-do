import { Injectable, Inject } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { CoreEvent } from './core.event';


@Injectable({
  providedIn: 'root',
})
export class CoreConfig {
  constructor(@Inject('Environment') private env, protected coreEvent: CoreEvent) {
    // Default values of environment and preferences
    this.preferences = null;
  }

  // TODO Functions so we allow data manipulations to be saved
   /* Data elements */
  public get notifications(): Array<object> {return this._notifications; }
  public set notifications(v: Array<object>) {this._notifications = v ? v : []; }

  public get messages(): Array<object> {return this._messages; }
  public set messages(v: Array<object>) {this._messages = v ? v : []; }

  public get shoppingBasket(): Array<object> {return this._shoppingBasket; }
  public set shoppingBasket(v: Array<object>) {this._shoppingBasket = v ? v : []; }

  public get events(): Array<object> {return this._events; }
  public set events(v: Array<object>) {this._events = v ? v : []; }

  public get todoList(): Array<object> {return this._todoList; }
  public set todoList(v: Array<object>) {this._todoList = v ? v : []; }

  public get currentUser(): object {return this._currentUser; }
  public set currentUser(v: object) {
    this._currentUser = v || {};
    if (v && v['preferences']) {
      this.preferences = v['preferences'];
    }
  }

  public get preferences(): object {return this._preferences; }
  public set preferences(v: object) {
    if (v == null) {
      this._preferences = {};
    } else {
      this._preferences = Object.assign(this._preferences, v);
    }
    // We also load the preferences into the enviromnent
    this.environment = Object.assign({
      backendList: ['localhost'], // List of available back-ends configurations
      backend : 'localhost', // The default backend
      backendRefresh: 10000, // For testing every 10 seconds refresh

      // These value can be set also within backend config
      lockScreen: false, // Should we enable a lock screen on lost focus or idle time
      lockIdle: 5, // Time in min you need to be idle before lock screen is triggered
      lockLogout: 0, // Time in min you will be logged out when idle, 0 means disabled
      demo: this.env ? this.env.length === 0 : true, // For development and test purpose we use demo data
      appID: 'ng-do-cdk', // ID to identify the application
      passwordPattern: '^(?=.*[0-9])(?=.*[A-Z])([a-zA-Z0-9!@#$%^&*()]+)$', // The default password pattern
      passwordMin: 6, // Minimal length of password -->not checked during login
      passwordMax: 26, // Maximal length of password
      'localhost' : {
         title: 'Localhost JSON',
         type: 'do-proxy',
         apiURL: 'http://localhost:3000', // We point default to the json-server
      },
    }, this.env, this._preferences);
  }
   public get backend(): string {
    if (!this._backend) {
      this._backend = this.getItem(CoreConfig.backendKey, this.environment['backend'], true);
    }
    if (!this.environment[this._backend]) { this._backend = this.environment['backend']; }
    return this._backend;
  }

  public set backend(value: string) {
    this._backend = value; // Change modes
    this.setItem(CoreConfig.backendKey, value);
  }

  public get backendEnv(): any {
    return this.environment[this.backend] || [];
  }

  public get DEMO(): boolean {
    const isDemo: boolean = this.backendValue('demo', false);
    return isDemo;
  }
  public get TEST(): boolean {
    const isTest: boolean = this.backendValue('test', false);
    return isTest;
  }

  public get signupAllowed(): boolean {
    return this.backendEnv['signup'] !== false;
  }
  public get backendList(): any {
   if (this._backendList == null) {
     this._backendList = [];
     if (this.environment['backendList']) {
        this.environment['backendList'].forEach(function(id) {
         this._backendList.push({id: id, title: this.environment[id]['title'] || id,
                                 signup: this.environment[id]['signup'],
                                 type: this.environment[id]['type']});
        }, this);
      }
   }
   return this._backendList;
  }

  get authModel(): string {
    return (this.backendEnv['type']) === 'msal' ? 'redirect' : 'password';
  }

  public get baseUrl(): string {
    return document.getElementsByTagName('base')[0].href;
  }
  public get remember(): boolean {
    if (this._remember == null) {
      this._remember = this.getItem(CoreConfig.remember_key,
          this.environment['remember'] || false, true);
    }
    return this._remember;
  }

  public set remember(value: boolean) {
    if (this.remember !== value) {
      this._remember = value;
      this.setItem(CoreConfig.remember_key, this._remember);
      this.setItem(CoreConfig.backendKey, this._backend);
    }
  }

  /* Backend */
   public static readonly backendKey = 'backend_key';

  /* Remember indicated the user option */
  static readonly remember_key = 'remember';

  /* Wrapper functions for local and session storage */

  static readonly staticID = '000-000-000';
  public environment;

  /* Internal object to externally exposed data elements */
  private _notifications: Array<object> = [];
  private _messages: Array<object> = [];
  private _shoppingBasket: Array<object> = [];
  private _currentUser: object = {};
  private _events: Array<object> = [];
  private _todoList: Array<object> = [];
  private _preferences: object = {};

  /* Menu Declarations */
  // TODO: Add options to delete,update by name
  menus = [];
   private _backend: string;

  private _backendList: any = null;
  private _remember: boolean = null;
  public clearNotifications() {this._notifications = []; }
  public removeNotification(rec: object) {this._notifications.splice(this._notifications.indexOf(rec), 1); }
  public addNotification(rec: object) {if (this._notifications.indexOf(rec) < 0) { this._notifications.push(rec); }}
  public clearMessages() {this._messages = []; }
  public removeMessage(rec: object) {this._messages.splice(this._messages.indexOf(rec), 1); }
  public addMessage(rec: object) {if (this._messages.indexOf(rec) < 0) { this._messages.push(rec); }}
  public clearShopping() {this._shoppingBasket = []; }
  public removeShopping(rec: object) {this._shoppingBasket.splice(this._shoppingBasket.indexOf(rec), 1); }
  public addShopping(rec: object) {if (this._shoppingBasket.indexOf(rec) < 0) { this._shoppingBasket.push(rec); }}
  public clearEvents() {this._events = []; }
  public removeEvent(rec: object) {this._events.splice(this._events.indexOf(rec), 1); }
  public addEvent(rec: object) {if (this._events.indexOf(rec) < 0) { this._events.push(rec); }}


  /* Function to clear all data and reset to defaults*/
  public clear(byUser: boolean= false): void {
    if (byUser) {
      this._remember = null;
    }
    // this.shoppingBasket.length=0;
    this._shoppingBasket = [];
    this._messages = [];
    this._notifications = [];
    this._currentUser = {};
    this._events = [];
    this._todoList = [];
    this.preferences = null;
    this.coreEvent.send('clear', CoreEvent.core_channel);
  }

  public load(base: object= {}): Promise<boolean> {
    this.clear();
    if (this.backendValue('demo', false)) {
       console.log('Do -> You are using Demo mode, switch off by setting \'demo=false\' within environment');
       this._notifications = [
          {
              id: 'id',
              title: 'Mail 1',
              time: 1537691208103,
              state: 'state'
          },
          {
              id: 'id',
              title: 'Mail 2',
              time: 1537693208103,
              state: 'state'
          },
          {
              id: 'id',
              title: 'Mail 5',
              time: 1537690208103,
              state: 'state'
          }
       ];
       this._currentUser = {
          avatar_url: 'assets/images/avatars/hari.jpg',
          name: 'Demo User'
       };
       this._events = [
              {
                id: 'id',
                title: 'Business Meeting',
                time: '05:00 PM',
                state: 'state'
            },
            {
                id: 'id',
                title: 'Ask for a Vacation',
                time: '05:00 PM',
                state: 'state'
            },
            {
                id: 'id',
                title: 'Dinner with Micheal',
                time: '05:00 PM',
                state: 'state'
            },
            {
                id: 'id',
                title: 'Deadline for Project ABC',
                time: '05:00 PM',
                state: 'state'
            },
        ];
        this._todoList = [
              {
                id: 'id',
                title: 'Get to know Angular more',
                time: 'Added:4 days ago',
            },
            {
                id: 'id',
                title: 'Configure new Router',
                time: 'Added:4 days ago',
            },
            {
                id: 'id',
                title: 'Invite Joy to play Carroms',
                time: 'Added:4 days ago',
            },
            {
                id: 'id',
                title: 'Check SRS of Project X',
                time: 'Added:4 days ago',
            },
        ];
        this._messages = [
            {from: 'Catherin', subject: 'Shopping', content: 'hi there??'},
            {from: 'Jack', subject: 'Function', content: 'yes'},
            {from: 'Karina', subject: 'Get together', content: 'nice'},
            {from: 'Micheal', subject: 'Trip', content: 'ya.. I will'},
            {from: 'Ashik', subject: 'Meeting', content: 'Time??'},
            {from: 'Joy', subject: 'Party', content: 'Lets enjoy'},
        ];
       /* Shopping Basket */
        this._shoppingBasket = [
          { title: 'Service 1', cost: 10.0, count: 1}
        ];
        /* User Preference and data */
        this._preferences = {};
    }
    this.coreEvent.send('load', CoreEvent.core_channel);
    return Promise.resolve(true);
  }
  public addMenu(menu): void {
    this.menus.push(menu);
  }

  public backendValue(key: string, defaultValue: any= null): any {
    try {
    return (this.environment[this.backend] ? this.environment[this.backend][key] || this.environment[key]
        :  this.environment[key]) || defaultValue;
    } catch (ex) {
      return defaultValue;
    }
  }

  /* Decode a JWT Token */
  public decodeJWT(token: string): object {
    try {
      let _token = token.split('.')[1];
      _token = _token.replace('-', '+').replace('_', '/');
      return JSON.parse(atob(_token));
    } catch (ex) {
      return null;
    }
  }

  public clearStorage(byUser: boolean): void {
    if (byUser) {
      localStorage.clear();
      // Save remember
      this.setItem(CoreConfig.remember_key, this._remember);
    }
    sessionStorage.clear();
    // Save the  backend
    this.setItem(CoreConfig.backendKey, this._backend);
  }
  public getItem(key: string, defaultValue: any = null, force: boolean= false): any {
    try {
     let v = force || this._remember ?
      localStorage.getItem(key) ||  sessionStorage.getItem(key) :
      sessionStorage.getItem(key);
     v = JSON.parse(CryptoJS.AES.decrypt(v || defaultValue,
                (this.environment['appID'] ||  CoreConfig.staticID)
           ).toString(CryptoJS.enc.Utf8));
     if (v === 'null') { v = null; }
     return v;
    } catch (ex) {
      return defaultValue;
    }
  }

  public setItem(key: string, value: any= null ): void {
     if (value != null) {
       (this._remember ? localStorage : sessionStorage)
         .setItem(key, CryptoJS.AES.encrypt(JSON.stringify(value),
                (this.environment['appID'] ||  CoreConfig.staticID))
         .toString());
       (!this._remember ? localStorage : sessionStorage).removeItem(key);
     } else {
       localStorage.removeItem(key);
       sessionStorage.removeItem(key);
     }
  }

/* End Of Service */
}



