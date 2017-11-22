# Service for Education Social Network

## NOTE

    Các gói tin trả về có dạng: {code:<logic_code>, message: <detail_infomation>, data: <object_data>, [error: <error_object>]}.

    Logic code ở trên độc lập với HTTP_RESPONSE_CODE mặc định của giao thức HTTP, do vậy các lỗi liên quan đến kết nối (VD: timeout...) sẽ không được mô tả. Thông thường <logic_code> sẽ trùng với HTTP_RESPONSE_CODE. App sử dụng service nên tự động bắt các lỗi này, đặc biệt là timeout.

    Một số <logic_code> mặc định (dựa trên chuẩn HTTP) :
        + 1xx: Information.
        + 2xx: Success.
        + 3xx: Redirection.
        + 4xx: Client Error.
        + 5xx: Server Error.

    Các API sử dụng `userID`, sau sẽ được hỗ trợ thêm thông qua lưu trữ session phía service.

    Việc phân quyền về sau cũng sẽ sử dụng `userID` đã đăng nhập để kiểm tra (VD: Thao tác đối với người file, user, class, post...). Các API không đủ quyền xem xét service sẽ tự chuyển hướng đến giao diện tương ứng (đăng nhập/chấp nhận quyền);

    Các trường thông tin theo key:value đều hỗ trợ 2 định dạng _FORM_ & _JSON_ ngoại trừ các trường thông tin đặc biệt như file(dùng form-multilpart, có thể xem xét truyền dữ liệu dưới định dạng BinaryToText như `Base64` cho các file nhỏ trực tiếp trên định dạng JSON).

## REFERENCE

[API_DETAIL_UPDATE_LINK](https://app.swaggerhub.com/apis/huynv/profile_new/1.0.0)

---

## CHANGE LOG

---

## UPDATE LOG

### `23/10/2017`

#### Xong các API FileManager: `/files/*`

Thông tin **FileItem** bao gồm:

        id: :fileID
        name: ten_file_gui_len
        type: mime_type
        size: kich_thuoc_file_tinh_theo_byte
        createDate: thoi_gian_upload_theo_timezone_service

##### Upload 1 file (`/temp/test.html`)

    + Method: POST
    + URL: "http://domain:port/files/upload"
    + InputName: fileUpload"
    + Chưa có các chức năng lọc: size, type.
    + Chưa lưu người dùng upload: sẽ bổ sung sau.
    + Success: `data` chứa thông tin file vừa tài.
        {code: 200, message: '...', data: <file_info>}
    + Failed:
        {code: 500, message:..., data: null, error:error_message}

##### Upload 1 ảnh: Tương tự như upload file (`/temp/test.html`)

    + Method: POST
    + URL: http://domain:port/files/image"
    + InputName: imageUpload
    + Lọc chỉ file có đuôi "jpg/jpeg/png/gif", chưa lọc size.
    + Success: `data` là thông tin file đã upload.
        - {code: 200, message: "...", data: <file_info>}
    + Failed:
        - {code: 500, ...} : Client Error: Không upload được.
        - {code: 400, ...} : Server Error: File upload không thỏa mãn.

##### Xóa 1 file bằng `fileID` `(/temp/test.html)`

    + Method: DELETE
    + URL: http://domain:port/files/delete/:fileID : fileID cần xóa.
    + Success: `data` là thông tin file đã xóa.
        - {code: 200, message: "...", data: <file_info>}
    + Failed:
        - {code: 400, ...} : Client Error: Không tồn tại file.
        - {code: 500, ...} : Server Error: Không thể xóa.

##### Lấy thông tin file bằng `fileID`

    + Method: GET
    + URL: http://domain:port/files/info/:fileID : fileID cần lấy thông tin.
    + Success: `data` là thông tin file cần lấy.
        - {code: 200, message: "...", data: <fileID>}
    + Failed:
        - {code: 400, ...} : Client Error: Không tồn tại file.
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

##### Tải file, ảnh bằng `fileID`

    + Method: GET
    + URL: http://domain:port/files/get/:fileID (nên dùng khi load ảnh trên trình duyệt) hoặc http://domain:port/files/attach/:fileID (nên dùng khi tải file/ảnh): fileID cần tải.
    + Success: trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Không tồn tại file.
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

##### `[TEST_API]` Lấy về tất cả file tải lên: `(sau sẽ thay bằng người dùng)`

    + Method: GET
    + URL: http://domain:port/test/files
    + Success: `data` là mảng thông tin file.
        - {code: 200, message: "...", data: [...files]}
    + Failed:
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

---

### `31/10/2017`

#### Xong các API cơ bản của User: `/users/*`

Thông tin **User** bao gồm:

        id: userID unique
        username: user_name
        typeuser: type_user
        password: pass_word
        firstName: firstName
        lastName: lastname
        email: email|null:unique
        phone: phone|null:unique
        profileImageID: profile_image_fileID
        coverImageID: cover_image_fileID
        birthday: birthday
        gender: [NONE, FEMALE, MALE]
        about: about
        quote : quote
        nickname: array_string_nickname
        skills: array_skill
        worked: array_work
        language: array_language
        lifeEvent: array_life_Event
        classs: array_id_classs
        friends: array_id_friends
        status: [NEW, BLOCKED, NORMAL]
        location: location

**NOTE** : Thông tin cơ bản trả cho thông tin người dùng mặc định không bao gồm: `password`, `skills`, `friends`, `classs`, `status`, `lifeEvent` (_Sẽ có API riêng_).

##### Tạo người dùng với `username`

    + Method: POST
    + URL: http://domain:port/users/
    + Success: `data` là thông tin User được tạo.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Update thông tin người dùng qua `username`, không thể thay đổi `userID`, `username`

    + Method: PUT
    + URL: http://domain:port/users/
    + Success: `data` là thông tin User được update.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi thông tin người dùng qua `userID`

    + Method: PUT
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User được update.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin cơ bản người dùng qua `userID`

    + Method: GET
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User cần lấy.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa người dùng qua `userID`

    + Method: DELETE
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách bạn qua `userID`

    + Method: GET
    + URL: http://domain:port/users/friends/:userID
    + Success: `data` mảng id người dùng là bạn.
        - {code: 200, message: "...", data: [...friendIDs]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách nhóm qua `userID`

    + Method: GET
    + URL: http://domain:port/users/classs/:userID
    + Success: `data` mảng id nhóm.
        - {code: 200, message: "...", data: [...classs]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách file người dùng qua `userID`

    + Method: GET
    + URL: http://domain:port/users/files/:userID
    + Success: `data` mảng id file.
        - {code: 200, message: "...", data: [...files]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Profile qua `userID`

    + Method: GET
    + URL: http://domain:port/users/profileImage/:userID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Profile qua `userID`

    + Method: PUT, POST
    + URL: http://domain:port/users/profileImage/userID
    + InputName: `profileImage`.
    + Success: Thông tin tin file profile đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Cover qua `userID`

    + Method: GET
    + URL: http://domain:port/users/coverImage/:userID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh cover qua `userID`

    + Method: PUT, POST
    + URL: http://domain:port/users/coverImage/:userID
    + InputName: `coverImage`.
    + Success: Thông tin file avatar đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### `[TEST_API]` Lấy về tất cả User

    + Method: GET
    + URL: http://domain:port/test/users
    + Success: `data` là mảng thông tin user.
        - {code: 200, message: "...", data: [...users]}
    + Failed:
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

---

### `03/11/2017`

#### Xong các API Check cơ bản của kiểm tra tồn tại username/email/phone: `/checks/*`

##### Kiểm tra `username` đã sử dụng qua `:username`

    + Method: GET
    + URL: http://domain:port/checks/username/:username
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

##### Kiểm tra `email` đã sử dụng qua '`?email=...`'

    + Method: GET
    + URL: http://domain:port/checks/email?email=abc@gmail.com
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

##### Kiểm tra `phone` đã sử dụng qua `?phone=...`

    + Method: GET
    + URL: http://domain:port/checks/phone?phone=0123456xxx
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

### `07/11/2017`

#### Xong các API cơ bản của Group: `/groups/*`

Thông tin **Group** bao gồm:

        id: id_group unique
        name: group_name
        typegroup: type_group
        typeGroup: [PRIMARY, SECONDARY, UNIVERSITY]
        profileImageID: profile_image_fileID
        coverImageID: cover_image_fileID
        about: about
        dateCreated: dateCreate,
        location: location
        members: [{id,typemember,firstName,lastName,profileImageID}]
        status: [NEW, BLOCKED, NORMAL]

**NOTE** :

##### Tạo nhóm

    + Method: POST
    + URL: http://domain:port/groups/
    + Success: `data` là thông tin Group User được tạo.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Update thông tin nhóm qua `groupID`

    + Method: PUT
    + URL: http://domain:port/groups/:groupID
    + Success: `data` là thông tin Group được update.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin cơ bản nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/:groupID
    + Success: `data` là thông tin nhóm cần lấy.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa nhóm qua `groupID`

    + Method: DELETE
    + URL: http://domain:port/groups/:groupID
    + Success: `data` là thông tin nhóm xóa.
        - {code: 200, message: "...", data: <nhóm_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách thành viên qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/members/:groupID
    + Success: `data` mảng id người dùng là thành viên.
        - {code: 200, message: "...", data: [{id:id_member, typemember:type_member},...]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách file nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/files/:grouprID
    + Success: `data` mảng id file.
        - {code: 200, message: "...", data: [...files]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Profile nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/profileImage/:groupID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Profile nhóm qua `groupID`

    + Method: PUT, POST
    + URL: http://domain:port/groups/profileImage/:groupID
    + InputName: `profileImage`.
    + Success: Thông tin tin file profile đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Cover nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/coverImage/:groupID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Cover nhóm qua `groupID`

    + Method: PUT, POST
    + URL: http://domain:port/groups/coverImage/:groupID
    + InputName: `coverImage`.
    + Success: Thông tin file cover đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### `[TEST_API]` Lấy về tất cả nhóm

    + Method: GET
    + URL: http://domain:port/test/groupss
    + Success: `data` là mảng thông tin nhóm.
        - {code: 200, message: "...", data: [...users]}
    + Failed:
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

### `22/11/2017`

#### Xong các API thành viên của của Group: `/groups/*`

Thông tin **Member** bao gồm:

        _id: id
        firstName: String,
        lastName: String,
        profileImageID: String,
        coverImageID: String,
        typemember: { type: Number, min: 0, max: 1000, default: 1 },
        isRemoved: { type: Boolean, default: false, },
        dateJoin: Date,
        timeUpdate: Date,

##### Lấy tất cả thành viên nhóm

    + Method: GET
    + URL: http://domain:port/groups/members/:groupID
    + Success: `data` là thông tin các thành viên nhóm.
        - {code: 200, message: "...", data: [<member>...]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thêm thành viên nhóm qua `userID`

    + Method: POST
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` thông tin thành viên nhóm.
        - {code: 200, message: "...", data: <member_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi thông tin quyền thành viên nhóm qua `userID`

    + Method: PUT
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` là thông tin người dùng đã thay đổi..
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa thành viên nhóm qua `userID`

    + Method: DELETE
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` là thông tin thành viên nhóm xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách người dùng yêu cầu tham gia nhóm

    + Method: GET
    + URL: http://domain:port/requested/:groupID/:userID.
    + Success: `data` mảng người dùng yêu cầu tham gia nhóm.
        - {code: 200, message: "...", data: [<user_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xác nhận yêu cầu tham gia nhóm người dùng qua `userID`

    + Method: POST
    + URL: http://domain:port/requested/:groupID/:userID.
    + Success: `data` thông tin người dùng.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu tham gia nhóm người dùng qua `userID`

    + Method: DELETE
    + URL: http://domain:port/groups/profileImage/:groupID
    + Success: `data` thông tin người dùng.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

#### Xong các API khác của người dùng: `/users/*`

##### Lấy danh sách bạn qua `userID`

    + Method: GET
    + URL: http://domain:port/users/friends/:userID
    + Success: `data` mảng người dùng là bạn bè.
        - {code: 200, message: "...", data: [<user_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa bạn bè của `userID` qua `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/friends/:userID/:friendUserID
    + Success: `data` người dùng đã xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách lớp qua `userID`

    + Method: GET
    + URL: http://domain:port/users/classs/:userID
    + Success: `data` mảng nhóm là thành viên.
        - {code: 200, message: "...", data: [<group_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Ra khỏi nhóm với `userID` và `groupID`

    + Method: DELETE
    + URL: http://domain:port/users/classs/:userID/:groupID'
    + Success: `data` nhóm đã xóa.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã tạo của `userID`

    + Method: GET
    + URL: http://domain:port/users/request/:userID
    + Success: `data` mảng người dùng đã `userID` đã gửi yêu cầu.
        - {code: 200, message: "...", data: [<user_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Tạo yêu cầu đến người dùng của `userID` đến `friendUserID`

    + Method: POST
    + URL: http://domain:port/users/request/:userID/:friendUserID
    + Success: `data` thông tin người dùng tạo request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng của `userID` đến `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/request/:userID/:friendUserID
    + Success: `data` thông tin người dùng xóa request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã nhận của `userID`

    + Method: GET
    + URL: http://domain:port/users/requested/:userID
    + Success: `data` mảng người dùng đã gửi request cho `userID`.
        - {code: 200, message: "...", data: [<user_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xác nhận yêu cầu đến người dùng đến `userID` của `friendUserID`

    + Method: POST
    + URL: http://domain:port/users/requested/:userID/:friendUserID
    + Success: `data` thông tin người dùng đã xác nhận request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng đến `userID` của `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/requested/:userID/:friendUserID
    + Success: `data` thông tin người dùng xóa request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã tạo của `userID` đến nhóm.

    + Method: GET
    + URL: http://domain:port/users/classrequest/:userID
    + Success: `data` mảng nhóm đã `userID` đã gửi yêu cầu.
        - {code: 200, message: "...", data: [<group_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Tạo yêu cầu đến người dùng của `userID` đến nhóm `groupID`

    + Method: POST
    + URL: http://domain:port/users/classrequest/:userID/:groupID
    + Success: `data` thông tin nhóm tạo request.
        - {code: 200, message: "...", data: <group_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng của `userID` đến nhóm `groupID`

    + Method: DELETE
    + URL: http://domain:port/users/classrequest/:userID/:groupID
    + Success: `data` thông tin nhóm xóa request.
        - {code: 200, message: "...", data: <group_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin người dùng của `userID` theo từng trường

    + Method: GET
    + URL: http://domain:port/users//info/:userID?field1=&field2=...
    + Success: `data` thông tin cần lấy.
        - {code: 200, message: "...", data: [<field1='', field2='',...>,]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.
