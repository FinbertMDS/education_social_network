import { classConstants } from '../constants';
import { classService } from '../services';
import {history} from "../helpers/history";

export const classActions = {
    getAll,
    getById,
    getByUserId,
    insert,
    update
};

function getAll() {
    return dispatch => {
        dispatch(request());

        classService.getAll()
            .then(
                response => dispatch(success(response.data)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: classConstants.CLASSES_GETALL_REQUEST } }
    function success(classes) { return { type: classConstants.CLASSES_GETALL_SUCCESS, classes } }
    function failure(error) { return { type: classConstants.CLASSES_GETALL_FAILURE, error } }
}

function getById(id) {
    return dispatch => {
        dispatch(request());

        classService.getById(id)
            .then(
                response => dispatch(success(response.data)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: classConstants.CLASSES_GETBYID_REQUEST } }
    function success(classDetail) { return { type: classConstants.CLASSES_GETBYID_SUCCESS, classDetail } }
    function failure(error) { return { type: classConstants.CLASSES_GETBYID_FAILURE, error } }
}

function getByUserId(userId) {
    return dispatch => {
        dispatch(request());

        classService.getByUserId(userId)
            .then(
                response => dispatch(success(response.data)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: classConstants.CLASSES_GETBYUSERID_REQUEST } }
    function success(classes) { return { type: classConstants.CLASSES_GETBYUSERID_SUCCESS, classes } }
    function failure(error) { return { type: classConstants.CLASSES_GETBYUSERID_FAILURE, error } }
}

function insert(name) {
    return dispatch => {
        dispatch(request());

        classService.insert(name)
            .then(
                response => {
                    dispatch(success(response.data));
                    history.push('/classes');
                },
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: classConstants.CLASSES_INSERT_REQUEST } }
    function success(classDetail) { return { type: classConstants.CLASSES_INSERT_SUCCESS, classDetail } }
    function failure(error) { return { type: classConstants.CLASSES_INSERT_FAILURE, error } }
}

function update(classId, name, about, location) {
    return dispatch => {
        dispatch(request());

        classService.update(classId, name, about, location)
            .then(
                response => {
                    dispatch(success(response.data));
                    history.push('/classes' + classId);
                },
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: classConstants.CLASSES_UPDATE_REQUEST } }
    function success(classDetail) { return { type: classConstants.CLASSES_UPDATE_SUCCESS, classDetail } }
    function failure(error) { return { type: classConstants.CLASSES_UPDATE_FAILURE, error } }
}
