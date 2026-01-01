import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
  standalone: false
})
export class SideNavComponent implements OnInit {
  @Input() userName: string = 'User';
  @Input() userInitials: string = 'U';
  @Input() profilePicture: string | null = null;
  @Input() notificationCount: number = 0;
  @Input() activeNav: string = 'home';
  
  @Output() navChange = new EventEmitter<string>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  setActiveNav(nav: string): void {
    this.activeNav = nav;
    this.navChange.emit(nav);
    
    if (nav === 'notification') {
      this.notificationClick.emit();
    } else if (nav === 'create') {
      this.createClick.emit();
    }
  }

  onLogout(): void {
    this.logoutClick.emit();
  }
}

