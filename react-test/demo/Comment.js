import React from 'react'

class Comment extends React.Component {
    render() {
        const {from,text} = this.props;

        return (
            <div class="comment">
                <h3 class="comment__author">{from}</h3>
                <span class="comment__text">{text}</span>
            </div>
        )
    }
}

export default Comment;