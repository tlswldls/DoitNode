/**
 * 파일 업로드하기
 * 
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 *    http://localhost:3000/public/memo with image.html
 *
 */


// Express 기본 모듈 불러오기
var express = require('express')
, http = require('http')
, path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 익스프레스 객체 생성
var app = express();

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require('cors');
const { stringify } = require('querystring');

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더와 uploads 폴더 오픈
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());

//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname + Date.now())
    }
});

var upload = multer({ 
    storage: storage,
    limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

// 라우터 객체 참조
var router = express.Router();



// 라우팅 함수 등록// 파일 업로드 라우팅 함수 - 로그인 후 세션 저장함
router.route('/process/memo_with_image').post(upload.array('photo', 1), function(req, res) {
	console.log('/process/memo_with_image 처리함.');

	try {
		var files = req.files;
	
        console.dir('#===== 업로드된 첫번째 파일 정보 =====#')
        console.dir(req.files[0]);
        console.dir('#=====#')
        
		// 현재의 파일 정보를 저장할 변수 선언
		var originalname = '',
			filename = '',
			mimetype = '',
			path = '',
			size = 0;
		
		if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
	        console.log("배열에 들어있는 파일 갯수 : %d", files.length);
	        
	        for (var index = 0; index < files.length; index++) {
	        	originalname = files[index].originalname;
	        	filename = files[index].filename;
	        	mimetype = files[index].mimetype;
	        	size = files[index].size;
	        }
	        
	    } else {   // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
	        console.log("파일 갯수 : 1 ");
	        
	    	originalname = files[index].originalname;
	    	filename = files[index].name;
	    	mimetype = files[index].mimetype;
	    	size = files[index].size;
	    }
		
		console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
				+ mimetype + ', ' + size);
		
		// 클라이언트에 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h1>나의 메모</h1>');
		res.write('<br>');
		res.write('<div><p>메모가 저장되었습니다.</p></div>');
		res.write('<div><p>서버에 저장된 사진</p></div>');
		res.write('<img alt="My Image" src="../uploads/'+filename + ' " width="200px" />');
		res.write('<div><p>'+ originalname +'</p></div>');
		res.write("<br><br>");
    	res.write("<button><a href='/public/memo with image.html'>다시 작성</a></button>");
		res.end();
		
	} catch(err) {
		console.dir(err.stack);
	}	
});

// 라우터 객체를 app 객체에 등록
app.use('/', router);


// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function(req, res) {
	res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
