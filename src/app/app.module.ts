import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { PostViewerComponent } from './components/post-viewer/post-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    HomepageComponent,
    LoginComponent,
    SideNavComponent,
    CreatePostComponent,
    PostViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

