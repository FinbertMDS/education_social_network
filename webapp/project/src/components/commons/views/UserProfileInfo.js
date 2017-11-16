import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'

const UserProfileInfo = ({user}) => {
    const {username, fullName, profilePictureUrl, coverPhotoUrl} = user

    return(
        <div>
            <Link to={`/users/${username}`}>
                <span className="user-fullname">{fullName}</span>
            </Link>
        </div>
    )
}

UserProfileInfo.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string.isRequired,
        fullName: PropTypes.string.isRequired,
        profilePictureUrl: PropTypes.string.isRequired,
        coverPhotoUrl: PropTypes.string.isRequired,
    }).isRequired
}

export default UserProfileInfo