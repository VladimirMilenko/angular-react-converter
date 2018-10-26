import { Component, Input } from "@angular/core";
@Component({
  selector: "profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.styles.scss"]
})
export class Profile {
  @Input()
  profile_picture;
  @Input()
  username;
}