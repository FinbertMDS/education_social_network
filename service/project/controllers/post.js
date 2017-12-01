let PostItem = require('../models/post');
let Groups = require('../controllers/group');
let Utils = require('../application/utils');

async function getPostByID(id) {
    try {
        return await PostItem.findOne({_id: id});
    } catch (error) {
        return null;
    }
}

async function findPost(req) {
    if (req.posts.post_requested) {
        return req.posts.post_requested;
    }
    let id = null;
    if (req.query.postID) {
        id = req.query.postID;
    } else if (req.params.postID) {
        id = req.params.postID;
    } else if (req.body.postID) {
        id = req.body.postID;
    }
    if (id) {
        return await getPostByID(id);
    }
    return null;
}
async function checkPostRequest(req, res, next) {
    let post = await findPost(req);
    if (post && !post.isDeleted) {
        req.posts.post_requested = post;
        return next();
    } else {
        req.posts.post_requested = null;
        return res.status(400).send({
            status: 400,
            message: 'Post not exited or deleted',
            data: null
        });
    }
}
function getPost(req, res) {
    try {
        let post = req.posts.post_requested;
        return res.send({
            code: 200,
            message: 'Success',
            data: post.getBasicInfo(),
        });
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function addPost(req, res, next) {
    try {
        let group = req.groups.group_request;
        let user = req.users.user_request;
        if (!group.isMember(user)) {
            return res.status(400).send({
                code: 400,
                data: null,
                error: 'User not member'
            });
        }
        let currentFiles = req.fileitems.files_saved;//req.fileitems.file_saved;
        let title = req.body.title;
        let content = req.body.content;
        let topic = req.body.topic;
        if (!title || !content || !topic) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: error.message
            });
        }
        let isShow = req.body.isShow ? req.body.isShow : false;
        let isSchedule = req.body.isSchedule ? req.body.isSchedule : false;
        let scopeType = req.body.scopeType ? req.body.scopeType : 10;
        let startTime = req.body.startTime ? Utils.parseDate(req.body.startTime) : null;
        let endTime = req.body.endTime ? Utils.parseDate(req.body.endTime) : null;
        let members = req.body.members ? Utils.getNumberArray(req.body.members) : [];
        let options = {
            isShow: isShow,
            isSchedule: isSchedule,
            scopeType: scopeType,
            scheduleOptions: {
                startTime: startTime,
                endTime: endTime,
            },
            members: members,
        };
        let post = createNewPost(user, group, title, content, topic, currentFiles);
        group.addPost(post, topic, options);
        group = await group.save();
        post = await post.save();
        req.groups.group_request = group;
        req.posts.post_requested = post;
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}

async function deletePost(req, res, next) {
    try {
        let user = req.users.user_request;
        let post = await findPost(req);
        req.posts.post_requested = post;
        if (post.userCreate._id !== user._id) {
            if (!user.isTeacher()) {//TODO: Check current group.
                return res.status(400).send({
                    code: 400,
                    message: 'Request Invalid. Only owner post or teacher can delete',
                    data: null,
                    error: 'Permit invalid'
                });
            }
        }
        if (!post) {
            return res.status(400).send({
                code: 400,
                message: 'Post Not Existed',
                data: null
            });
        }
        if (post.isDeleted) {
            return res.status(400).send({
                code: 400,
                message: 'Post deleted.',
                data: null
            });
        } else {
            post.isDeleted = true;
            post = await post.save();
            req.posts.post_requested = post
        }
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function updatePost(req, res) {
    try {
        let user = req.users.user_request;
        let post = req.posts.post_requested;
        if (post.userCreate._id !== user._id) {
            if (!user.isTeacher()) {//TODO check current group
                return res.status(400).send({
                    code: 400,
                    message: 'Request Invalid. Only owner post or teacher can editable.',
                    data: null,
                    error: 'Permit invalid'
                });
            }
        }
        let title = req.body.title;
        let content = req.body.content;
        let isBlockComment = req.body.isBlockComment ? req.body.isBlockComment === 'true' : false;
        let topics = req.body.topics;
        if (title) post.title = title;
        if (content) post.content = content;
        post.setBlockComment(isBlockComment);
        if (req.fileitems.files_saved) {
            post.addFiles(req.fileitems.files_saved, true);
        }
        if (topics) {
            post.topics = Utils.getStringArray(topics).map(topic => ({_id: topic, isDeleted: false}));//TODO update group topic.
        }
        post = await post.save();
        req.posts.post_requested = post;
        return res.send({
            code: 200,
            message: 'Success',
            data: post.getBasicInfo(),
        });
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function addComment(req, res) {

}

async function getComments(req, res) {//bulk comments with index.
    try {
        let post = req.posts.post_requested;
        return res.send({
            code: 200,
            message: 'Success',
            data: post.getComments(),
        });
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function deleteComment(req, res) {

}

async function updateComment(req, res) {

}

async function getPostsInTopic(req, res) {
    try {
        let datas = [];
        let group = req.groups.group_request;
        let topicName = req.query.topicname;
        if (!topicName) {
            datas = group.getTopics();
        } else {
            let posts = await PostItem.find({isDeleted: false, "group._id": group._id, topics: {$elemMatch:{_id: topicName}}});
            datas = posts.map(post => post.getBasicInfo());
        }
        res.json({
            code: 200,
            message: 'Success',
            data: datas
        });
    } catch(error) {
        res.status(500).json({
           code: 500,
           message: 'Server Error',
           error: error.message,
        });
    }
}

async function getLikes(req, res) {
    try {
        let post = req.posts.post_requested;
        return res.send({
            code: 200,
            message: 'Success',
            data: post.getLikes(),
        });
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function addLike(req, res, next) {
    try {
        let post = req.posts.post_requested;
        let user = req.users.user_request;
        if (post.addLike(user)) {
            post = await post.save();
            req.posts.post_requested = post;
            return next();
        } else {
            throw new Error("Can't add like to post");
        }
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function removeLike(req, res, next) {
    try {
        let post = req.posts.post_requested;
        let user = req.users.user_request;
        if (post.removeLike(user)) {
            post = await post.save();
            req.posts.post_requested = post;
            return next();
        } else {
            throw new Error("Can't add like to post");
        }
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

function createNewPost(user, group, title, content, topic, files = null) {
    if (!user || !group) return null;
    let now = Date.now();
    let post =  new PostItem ({
        _id: now,
        title: title,
        content: content,
        userCreate: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        },
        group: {
            _id: group._id,
            name: group.name,
            profileImageID: group.profileImageID,
            timeUpdate: now,
        },
        topics: [],
        comments: [],
        likes: [],
        options:{ isBlockComment: false },
        files: [],
        countComments: 0,
        countLikes: 0,
        isDeleted: false,
        timeCreate: now,
        timeUpdate: now,
    });
    if (topic) {
        post.addTopic(topic);//TODO: Add many topic
    }
    if (Array.isArray(files)) {
        post.addFiles(files);
    } else if(files) {
        post.addFile(files)
    }
    return post;
}

//------------------EXPORT---------------------
exports.checkPostRequest = checkPostRequest;
exports.addPost = addPost;
exports.deletePost = deletePost;
exports.updatePost = updatePost;

exports.addComment = addComment;
exports.getComments = getComments;
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;

exports.getPost = getPost;
exports.getPostByID = getPostByID;
exports.getPostsInTopic = getPostsInTopic;

exports.getLikes = getLikes;
exports.addLike = addLike;
exports.removeLike = removeLike;





