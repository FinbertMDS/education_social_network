# Service for Education Social Network


### NOTE: 
- Các gói tin trả về có dạng: <i>{code:logic_code, message: infomation, data: data, [error: error]}</i>
- Logic code ở trên độc lập với HTTP_RESPONSE_CODE mặc định của giao thức HTTP, do vậy các lỗi liên quan đến kết nối (VD: timeout...) sẽ không được mô tả.
- Các mã trả về mặc định có HTTP_STATUS_CODE là 200 theo chuẩn không phân biệt kết quả tác vụ thành công hay không, trạng thái thành công mô tả trong logic code.
- Một số <logic_code> mặc định (dựa trên chuẩn HTTP) :
    + 1xx: Thông tin (information).
    + 2xx: Thành công (Success).
    + 3xx: Điều hướng (Redirection).
    + 4xx: Lỗi client request (Client Error).
    + 5xx: Lỗi server (Server Error)

### CHANGE LOG
#### 23/10/2017

#### Xong các API FileManager: tất cả các api mục này bắt đầu bằng <i>/files</i>
<i>NOTE</i>: Thông tin file bao gồm: {
        id: :file_id,
        name: ten_file_gui_len,
        type: mime_type,
        size: kich_thuoc_file_tinh_theo_byte,
        createDate: thoi_gian_upload_theo_timezone_service
    }
##### Upload 1 file (chi tiết ví dụ trong /temp/test.html)
+ Chỉ 1 file.
+ \<form method="POST" action="<a>http://domain:port/files/upload</a>"\>
+ Thẻ \<input type="file" name="file_upload"\>
+ Các thẻ input khác hiện thời bỏ qua, sẽ tích hợp nhận thông tin vào sau (VD khi đăng kí).
+ Chưa có các chức năng lọc: size, type.
+ Chưa lưu người dùng upload: sẽ bổ sung sau.
+ Thành công: data chứa thông tin file vừa tài.
    - <i>{code: 200, message: '...', data: { id: file_id, ...}}</i>
+ Thất bại: 
    - <i>{code: 500, message:..., data: null, error:error_message}</i>
##### Upload 1 ảnh: Tương tự như upload file ((chi tiết ví dụ trong /temp/test.html), bổ sung:
+ \<form method="POST" action="<a>http://domain:port/files/image</a>"\>
+ Thẻ \<input type="file" name="image_upload"\>
+ Lọc chỉ file có đuôi "<u>jpg/jpeg/png/gif</u>", chưa lọc size.
+ Thất bại: 
    - <i>{code: 500, ...}</i> -> Client Error: Không upload được.
    - <i>{code: 400, ...}</i> -> Server Error: File upload không thỏa mãn.
##### Xóa 1 file: (chi tiết ví dụ trong /temp/test.html)
+ Method: DELETE
+ URL: <a>http://domain:port/files/delete/:file_id</a> -> file_id cần xóa.
+ Thành công: data là thông tin file đã xóa.
    - <i>{code: 200, message: "...", data: {id: file_id, ...}}</i> 
+ Thất bại:
    - <i>{code: 400, ...}</i> -> Client Error: Không tồn tại file.
    - <i>{code: 500, ...}</i> -> Server Error: Không thể xóa
##### Lấy thông tin file: 
+ Method: GET
+ URL: <a>http://domain:port/files/info/:file_id</a> -> file_id cần lấy thông tin.
+ Thành công: data là thông tin file cần lấy.
    - <i>{code: 200, message: "...", data: {id: file_id, ...}}</i>
+ Thất bại:
    - <i>{code: 400, ...}</i> -> Client Error: Không tồn tại file.
    - <i>{code: 500, ...}</i> -> Server Error: Không thể lấy thông tin.

##### Tải file, ảnh.
+ Method: GET
+ URL: <a>http://domain:port/files/get/:file_id</a> -> file_id cần tài.
+ Thành công: trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
+ Thất bại: http_response_code khác 200 trùng với <logic_code>
    - <i>{code: 400, message:....}</i> -> Client Error: Không tồn tại file.
    - <i>{code: 500, ...}</i> -> Server Error: Không thể lấy thông tin.

##### Lấy về tất cả file tải lên: (sau sẽ thay bằng người dùng)
+ Method: GET
+ URL: <a>http://domain:port/files/test/list</a>
+ Thành công: data là mảng thông tin file.
    - <i>{code: 200, message: "...", data: [{file1...}, {file2...}, ...]...}</i>
+ Thất bại: 
    - <i>{code: 500, ...}</i> -> Server Error: Không thể lấy thông tin.



