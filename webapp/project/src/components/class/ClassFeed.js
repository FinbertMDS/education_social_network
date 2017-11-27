import React, {Component} from 'react'
import Post from "../commons/Post";
import NewComment from "../commons/views/NewComment";
import Comments from "../commons/Comments";

class ClassFeed extends Component {
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
                    feed && feed.length > 0 &&
                    feed.map((feedContent, index) =>
                        this.renderFeedDetail(feedContent, index)
                    )
                }
            </div>
        )
    }
}

export default ClassFeed;