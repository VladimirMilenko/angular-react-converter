import React from "react";

class Profile extends React.Component {
  render() {
    const { profile_picture, username } = this.props;

    return (
      <header className="user">
        <span className="avatar">
          <img className="avatar__img" src={profile_picture} />
        </span>

        <div className="user__info">
          <div className="name">
            {username}
            <a className="link" href="#">
              Follow
            </a>
          </div>
          <a className="location" href="#">
            Amsterdam
          </a>
        </div>
      </header>
    );
  }
}

export default Profile;