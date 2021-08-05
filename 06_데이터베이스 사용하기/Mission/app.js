// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , static = require('serve-static');

  //===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 =====//
var mysql = require('mysql');

//===== MySQL 데이터베이스 연결 설정 =====//
var pool      =    mysql.createPool({
    connectionLimit : 10, 
    host     : 'localhost',
    user     : 'root',
    password : 'tlswldls=99!',
    database : 'test',
    debug    :  false
});


// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

app.use('/public', static(path.join(__dirname, 'public')));


// 라우터 객체 참조
var router = express.Router();

// 라우팅 함수 등록
router.route('/process/memo').post(function(req, res) {
	console.log('/process/memo 처리함.');

	var paramWriter = req.body.id || req.query.id;
	var paramDate = req.body.date || req.query.date;
	var paramContents = req.body.contents || req.query.contents;
	
	    // pool 객체가 초기화된 경우, addMemo 함수 호출하여 사용자 추가
		if (pool) {
			addMemo(paramWriter, paramDate, paramContents, function(err, addedMemo) {
				// 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
				if (err) {
					console.error('메모 추가 중 에러 발생 : ' + err.stack);
					
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>메모 추가 중 에러 발생</h2>');
					res.write('<p>' + err.stack + '</p>');
					res.end();
					
					return;
				}
				
				// 결과 객체 있으면 성공 응답 전송
				if (addedMemo) {
					console.dir(addedMemo);
	
					console.log('inserted ' + addedMemo.affectedRows + ' rows');
					
					var insertId = addedMemo.insertId;
					console.log('추가한 레코드의 아이디 : ' + insertId);
					
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h1>나의 메모</h1>');
					res.write('<br>');
					res.write('<div><p>메모가 저장되었습니다.</p></div>');
					res.write("<br><br>");
    				res.write("<button><a href='/public/memo.html'>다시 작성</a></button>");
					res.end();
				} else {
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 추가  실패</h2>');
					res.end();
				}
			});
		} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>데이터베이스 연결 실패</h2>');
			res.end();
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

//메모를 등록하는 함수
var addMemo = function(writer, date, contents, callback) {
	console.log('addMemo 호출됨 : ' + writer + ', ' + date + ', ' + contents);
	
	// 커넥션 풀에서 연결 객체를 가져옴
	pool.getConnection(function(err, conn) {
        if (err) {
        	if (conn) {
                conn.release();  // 반드시 해제해야 함
            }
            
            callback(err, null);
            return;
        }   
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    	// 데이터를 객체로 만듦
    	var data = {writer:writer, date:date, contents:contents};
    	
        // SQL 문을 실행함
        var exec = conn.query('insert into memo set ?', data, function(err, result) {
        	conn.release();  // 반드시 해제해야 함
        	console.log('실행 대상 SQL : ' + exec.sql);
        	
        	if (err) {
        		console.log('SQL 실행 시 에러 발생함.');
        		console.dir(err);
        		
        		callback(err, null);
        		
        		return;
        	}
        	
        	callback(null, result);
        	
        });
        
        conn.on('error', function(err) {      
              console.log('데이터베이스 연결 시 에러 발생함.');
              console.dir(err);
              
              callback(err, null);
        });
    });
	
}
