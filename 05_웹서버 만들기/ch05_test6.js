var http = require('http');
var fs = require('fs');

//웹 서버 객체를 만든다.
var server = http.createServer();

//웹 서버를 시작하여 3000번 포트에서 대기
var port = 3000;
server.listen(port, function(){
    console.log('웹 서버가 시작되었습니다. : %d', port);
});

//클라이언트 연결 이벤트 처리
server.on('connection', function(socket){
    var addr = socket.address();
    console.log('클라이언트가 서버에 접속했습니다. : %s, %d', addr.address, addr.port);
});

//클라이언트 요청 이벤트 처리
server.on('request', function(req, res){
    console.log('클라이언트 요청이 들어왔습니다.');

    //클라이언트로부터 요청이 들어오면 이미지 보여주기
    var filename = 'house.png';
    var infile = fs.createReadStream(filename, {flags: 'r'});

    //파이프로 연결하여 알아서 처리하도록 설정
    infile.pipe(res);
});

//서버 종료 이벤트 처리
server.on('close', function(){
    console.log('서버가 종료됩니다.');
});