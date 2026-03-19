import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [AdminPanelComponent], 
  template: `
    <div style="position: absolute; top: 20px; right: 20px; text-align: right; z-index: 1000;">
      
      <div 
        (click)="toggleMenu()" 
        style="cursor: pointer; display: flex; align-items: center; gap: 10px; background: white; padding: 8px 16px; border-radius: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: bold; color: #333; border: 1px solid #eee;">
        <div style="width: 32px; height: 32px; background: #37c3bb; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
          A
        </div>
        Admin User ▼
      </div>

      @if (isMenuOpen) {
        <div style="margin-top: 10px; background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); overflow: hidden; text-align: left; border: 1px solid #eee;">
          
          <button (click)="openAdminPanel()" style="display: block; width: 100%; padding: 12px 20px; border: none; background: none; cursor: pointer; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
            Admin Panel
          </button>

          <button (click)="logout()" style="display: block; width: 100%; padding: 12px 20px; border: none; background: none; cursor: pointer; color: #ff4d4d; font-weight: bold; font-size: 14px;">
            Log out
          </button>
        </div>
      }
    </div>

    @if (showAdminPanel) {
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center;">
        <div style="position: relative; width: 90vw; max-width: 1200px; height: 90vh; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          
          <button (click)="closeAdminPanel()" style="position: absolute; top: -15px; right: -15px; width: 40px; height: 40px; border: none; background: #ff4d4d; color: white; border-radius: 50%; font-size: 20px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 2010;">
            ✖
          </button>
          
          <app-admin-panel></app-admin-panel>
          
        </div>
      </div>
    }
  `
})
export class UserPanelComponent {
  isMenuOpen = false;
  showAdminPanel = false; 
  private router = inject(Router);

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  
  openAdminPanel() {
    this.showAdminPanel = true;
    this.isMenuOpen = false; 
  }

  
  closeAdminPanel() {
    this.showAdminPanel = false;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}