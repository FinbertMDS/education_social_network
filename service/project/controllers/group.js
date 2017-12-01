let Group = require('../models/group');
let UserControllers = require('../controllers/user');
let Users = require('../models/user')
let Files = require('../models/fileitem');
let Post = require('../models/post');
let Utils = require('../application/utils');

async function getGroupByID(id) {
    if (!id) {
        return null;
    }
    let _id = Number(id);
    if (_id) {
        return await Group.findOne({
            _id: id,
            //isDeleted: false,
        });
    } else {
        return null;
    }
}
async function findGroup(req) {
    if (req.groups.group_request) {
        return req.groups.group_request;
    }
    let groupFind = null;
    if (req.params.groupID) {
        groupFind = await getGroupByID(req.params.groupID);
        if (groupFind) {
            return groupFind;
        }
    }
    if (req.body.groupID) {
        groupFind = await getGroupByID(req.body.groupID);
        if (groupFind) {
            return groupFind;
        }
    }
    return null;
}
async function addMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.addMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("Add member error");
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            error: error.message
        });
    }
}
async function removeMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (group.removeMember(user)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            error: error.message
        });
    }
}
async function updateMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.updateMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("UpdateMember Error, user is Remove");//
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function getRequesteds(req, res) {
    try {
        //TODO: Check current user.
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: 'Success',
            data: group.getRequesteds()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function removeRequested(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req, false);
        //req.users.user_request = user;
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (user.removeClassRequest(group)) {
            if (group.removeRequested(user)) {
                group = await group.save();
                user = await user.save();
            }
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function confirmRequested(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req, false); //req.users.user_request = user;
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (group.confirmRequested(user)) {
            group = await group.save();
            user = await user.save();
        } else {
            //throw new Error();
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
function updateGroupInfo(req, group, isCheckValidInput = true) {
    let message = [];
    if (isCheckValidInput) {
        message = Group.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return message;
        }
    }
    if (req.body.name) {
        group.name = req.body.name;
    }
    if (req.body.dateCreated) {
        group.birthday = Group.getCreateDate(req.body.dateCreated);
    }
    if (req.body.about) {
        group.about = req.body.about;
    }
    if (req.body.tags) {
        group.tags = Utils.getStringArray(req.body.tags);
    }
    if (req.body.language) {
        group.language = Group.getArrayLanguage(req.body.language);
    }
    if (req.body.location) {
        group.location = req.body.location;
    }
    if (req.body.typegroup) {
        group.typegroup = req.body.typegroup;
    }
    return message;
}
async function postGroup(req, res, next) {
    try {
        let userCreate = req.users.user_request;
        if (!userCreate.isTeacher()) {
            return res.status(400).send({
                code: 400,
                data: null,
                error: 'Only teacher can create group.'
            });
        }
        req.groups.group_request = null;
        let message = Group.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return res.status(400).send({
                code: 400,
                message: message,
                data: null,
                error: 'Request Invalid'
            });
        }
        let group = new Group({
            name: req.body.name,
            isDeleted: false,
            dateCreated: Date.now(),
        });
        message = updateGroupInfo(req, group, false);
        if (!message || message.length > 0) {
            return res.status(400).send({
                code: 400,
                message: message,
                data: null,
                error: 'Request Invalid',
            });
        }
        if (!group.addAdminMember(userCreate)) {
            throw new Error("Add member to class error");
        }
        userCreate = await userCreate.save();
        req.users.user_request = userCreate;
        if (req.body.members) {
            let userIDs =  Utils.getStringArray(req.body.members);
            let users = await UserControllers.getManyUsers(userIDs);
            if (!users) {
                return next();
            }
            users.forEach(usermember => {
               if (usermember.isTeacher()) {
                   group.addAdminMember(usermember);
               } else {
                   group.addNormalMember(usermember);
               }
            });
            Promise.all(users.map(user => user.save())).then(async usersaved => {
                try {
                    group = await group.save();
                    req.users.users_request = usersaved;
                    req.users.user_request = userCreate;
                    req.groups.group_request = group;
                    next();
                } catch(error) {
                    next(error);
                }
            }).catch(error => next(error));
        } else {
            req.users.user_request = userCreate;
            req.groups.group_request = group;
            return next();
        }
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
};
async function putGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        let user = await UserControllers.findUser(req);
        if (!user || !group.isAdmin(user)) {
            return res.status(400).send({
                code: 400,
                message: '',
                data: null,
                error: 'User not permit '
            });
        }
        let message = Group.validateInputInfo(req.body, false);
        if (message && message.length === 0) {
            message = updateGroupInfo(req, group, false);
            if (message && message.length === 0) {
                group = await group.save();
                req.groups.group_request = group;
                return next();
            }
        }
        return res.status(400).send({
            code: 400,
            message: message,
            data: null,
            error: 'Request Invalid',
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function deleteGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req);
        if (!user || !group.isAdmin(user)) {
            return res.status(400).send({
                code: 400,
                message: '',
                data: null,
                error: 'User not permit '
            });
        }
        group.isDeleted = true;
        group = await group.save();
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    };
}
async function getGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: 'Success',
            data: group.getBasicInfo()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function getProfileImageID(req, res, next) {
    req.files.file_selected_id = req.groups.group_request ? req.groups.group_request.profileImageID : null;
    return next();
}
async function putProfileImage(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        if (!req.files.file_saved) {
            throw new Error("Upload file Error");
        }
        let currentFile = req.files.file_saved;
        group.profileImageID = String(currentFile._id);
        group = await group.save();
        return res.json({
            code: 200,
            message: 'Success',
            data: currentFile.getBasicInfo(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function getCoverImageID(req, res, next) {
    req.files.file_selected_id = req.groups.group_request ? req.groups.group_request.coverImageID : null;
    return next();
}
async function putCoverImage(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        if (!req.files.file_saved) {
            throw new Error("Upload file Error");
        }
        let currentFile = req.files.file_saved;
        group.coverImageID = String(currentFile._id);
        group = await group.save();
        return res.json({
            code: 200,
            message: 'Success',
            data: currentFile.getBasicInfo(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function getMembers(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: '',
            data: group.getMembersInfo()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function checkGroupRequest(req, res, next) {
    let group = await findGroup(req);
    if (group && !group.isDeleted) {
        req.groups.group_request = group;
        return next();
    } else {
        req.groups.group_request = null;
        return res.status(400).send({
            status: 400,
            message: 'Group not exited or deleted',
            data: null
        });
    }
}
async function getGroups(req, res) {
    try {
        let groups = await Group.find({
            isDeleted: false,
        });
        return res.json({
            code: 200,
            message: 'Success',
            count: groups.length,
            data: groups.map(group => group.getBasicInfo())
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};
async function getFiles(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let datas = (await Files.find({
            isDeleted: false,
            'group._id': group._id,
        }, { _id: 1, name: 1, type: 1, size: 1, createDate: 1 })).map(file => file.getBasicInfo());
        return res.send({
            code: 200,
            message: 'Success',
            length: datas.length,
            data: datas
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: 'Server Error',
            data: null
        });
    }
}
async function searchGroupByName(req, res) {
    try {
        let key = req.query.groupname;
        if (!key) {
            return res.status(400).json({ code: 400, message: '', data: [] });
        }
        let groups = await Group.find({ name: { $regex: key } });
        return res.status(200).json({
            code: 200,
            message: '',
            data: groups.map(group => group.getBasicInfo())
        });
    } catch (error) {
        return res.status(500).json({ code: 500, message: '', data: [] });
    }
}
async function addPost(req, res, next) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let userID = req.params.userID ? req.params.userID : req.body.userID ? req.body.userID : null;
        let user = group.getMemberById(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: message,
                data: null,
                error: 'User not member'
            });
        }
        let currentFile = req.files.file_saved;
        let title = req.body.title;
        let content = req.body.content;
        let topic = req.body.topic;
        if (!title || !content || !topic) {
            return res.status(500).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: error.message
            });
        }
        let isShow = req.body.isShow ? req.body.isShow : false;
        let isSchedule = req.body.isSchedule ? req.body.isSchedule : false;
        let scopeType = req.body.scopeType ? req.body.scopeType : 10;
        let startTime = req.body.startTime ? Utils.parseDate(req.bodyiinp.startTime) : null;
        let endTime = req.body.endTime ? Utils.parseDate(req.body.endTime) : null;
        let members = req.body.members ? Utils.getStringArray(req.body.members) : [];

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
        let now = Date.now();
        let post = new Post({
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
        });
        post.addTopic(topic);
        if (currentFile) {
            post.addFile(currentFile);
        }
        group.addPost(post, topic, options);
        group = await group.save();
        post = await post.save();
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
async function getPosts(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let userID = req.params.userID ? req.params.userID : req.body.userID ? req.body.userID : null;
        let user = group.getMemberById(userID);
        // if (!user) {
        //     return res.status(400).send({
        //         code: 400,
        //         message: message,
        //         data: null,
        //         error: 'User not member'
        //     });
        // }
        let posts = group.posts;
        let top = req.query.top ? isNaN(req.query.top) ? -1 : Number(req.query.top) : -1;
        let postIDs = group.getPostIDs(user);
        let datas = [];
        if (postIDs.length > 0) {
            posts = await Post.find({ _id: { $in: postIDs } });
            datas = posts.map(post => post.getBasicInfo());
        } 
        return res.status(200).json({
            code: 200,
            message: '',
            data: datas,
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

function getTopics(req, res) {
    try {
        let group = req.groups.group_request;
        return res.status(200).json({
            code: 200,
            message: '',
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function addTopic(req, res) {
    try {
        let group = req.groups.group_request;
        let topic = null;
        if (req.query.topicname) {
            topic = req.query.topicname;
        } else if (req.param.topicname) {
            topic = req.param.topicname;
        } else if (req.body.topicname) {
            topic = req.body.topicname;
        }
        if (!topic) return res.status(400).json({code: 400, error: 'Topic name not exit'})
        if (!group.addTopic(topic)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function addTopics(req, res) {
    try {
        let group = req.groups.group_request;
        if (!req.body.topics) {
            return res.status(400).json({code: 400, error: 'Topic name not exit'})
        }
        let topics = Utils.getStringArray(req.body.topics);
        if (!group.addTopics(topics)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function removeTopic(req, res) {
    try {
        let group = req.groups.group_request;
        let topic = req.query.topicname;
        if (!topic) return res.status(400).json({code: 200, error: 'Topic name not exit'})
        if (group.removeTopic(topic)) {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
/*----------------EXPORT------------------ */
exports.postGroup = postGroup;
exports.putGroup = putGroup;
exports.getGroup = getGroup;
exports.deleteGroup = deleteGroup;
exports.getMembers = getMembers;
exports.checkGroupRequest = checkGroupRequest;
exports.putProfileImage = putProfileImage;
exports.putCoverImage = putCoverImage;
exports.getProfileImageID = getProfileImageID;
exports.getCoverImageID = getCoverImageID;
exports.addMember = addMember;
exports.removeMember = removeMember;
exports.updateMember = updateMember;
exports.getRequesteds = getRequesteds;
exports.removeRequested = removeRequested;
exports.confirmRequested = confirmRequested;
exports.getGroups = getGroups;
exports.findGroup = findGroup;
exports.getGroupByID = getGroupByID;
exports.getFiles = getFiles;
exports.searchGroupByName = searchGroupByName;
exports.addPost = addPost;
exports.getPosts = getPosts;
exports.getTopics = getTopics;
exports.addTopic = addTopic;
exports.addTopics = addTopics;
exports.removeTopic = removeTopic;