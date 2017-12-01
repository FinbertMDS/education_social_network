import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import Post from "./Post";
import NewComment from "./views/NewComment";
import Comments from "./Comments";

class Feed extends Component {
    renderFeedDetail(feedContent, index) {
        return (
            <div key={index} className="feed-content">
                <Post post={feedContent.post}/>
                <div className="post-new-comment">
                    <NewComment post={feedContent.post}/>
                </div>
                <Comments comments={feedContent.post.comments} post={feedContent.post}/>
            </div>
        )
    }

    render() {
        const {feed} = this.props
        return (
            <div className="feed">
                {
                    (feed && feed.length > 0) ?
                        (
                            feed.map((feedContent, index) =>
                                this.renderFeedDetail(feedContent, index)
                            )
                        ) :
                        <div className="no-post">No post</div>
                }
            </div>
        )
    }
}

export default Feed;