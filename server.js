var http=require("http");
var express=require("express"); //외부
var bodyParser=require("body-parser"); //외부
var mysql=require("mysql"); //외부

//template 엔진을 이용할 것이기에 ejs는 require 할 필요는 없으나
//반드시 모듈은 존재해야 하므로, 다운받아야 한다!!
var app=express();
var server=http.createServer(app);

//각종 미들웨어 및 기타 설정 
app.use(express.static(__dirname+"/views"));
app.use(express.static(__dirname));

app.set("view engine","ejs"); //보여질 뷰들의 기본 파일을 ejs로 지정
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//커넥션 풀 객체 생성
/*Connection Pool의 목적? 
	- 웹서버에 클라이언트가 요청을 시도할때마다  데이터베이스를
	접속하면, 네트워크,권한 등등 복잡한 과정을 거치는 Connection
	을 맺는 과정이 반복되어지므로, 많은 수의 사용자가 한꺼번에
	들어올경우 업무처리가 성능상 문제로 인하여 느려짐....
	해결책)  접속자가 없더라도 미리 접속을 여러개 확보해놓고 
	      클라이언트가 요청을시도할때 그 확보해놓았던 접속객체를
		  대여해줘서 업무를 처리하는 방식...( 대부분의 웹프로그래밍
		  분야에서 많이 알려진 방식)
		  Nodejs에서는 커넥션풀을 자체적으로 구현한 기능이 mysql 모듈
		  에 포함되어 있다...
*/
var pool=mysql.createPool({
	host:"localhost",
	user:"root",
	password:"",
	database:"front"
});

//부서 목록 요청 처리 
app.get("/dept/list", function(request, response){
	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="select * from dept order by deptno asc";
			con.query(sql, function(err, result, fields){
				if(err){
					console.log(err,"쿼리수행 실패");
					con.release(); //다시 풀로 돌려보냄...
				}else{
					console.log(result);
					//클라이언트에 데이터 전송하자!!
					response.writeHead(200,{"Content-Type":"text/json"});
					
					//json 객체 자체는 전송할수 없는 형태이므로, 문자열화 시키자
					//네트워크를 타고 전송되는 모든 데이터는 사실 문자이다...
					response.end(JSON.stringify(result));
				}

				con.release();
			});//쿼리수행
		}
	});

});


//사원 등록 요청 처리 
app.post("/emp/regist", function(request, response){
	console.log(request.body); //json으로 파라미터를 받는다!!

	var name=request.body.name;
	var id=request.body.id;
	var deptno=request.body.deptno;

	pool.getConnection(function(error, con){
		if(error){
			console.log("접속 객체 얻기 실패", error);
		}else{
			console.log("접속 객체 얻어옴!!");
			
			var sql="insert into emp(ename, id, deptno) values(?,?,?)";

			con.query(sql, [name, id, deptno], function(err, result){

				response.writeHead(200, {"Content-Type":"text/html"});

				if(err){
					console.log(err, "등록실패");
					response.end("{\"result\":\"fail\"}");
				}else{
					console.log("등록성공");
					response.end("{\"result\":\"success\"}");
				}
				con.release();
			});

		}
	});
});

//사원 목록 요청 처리 
app.get("/emp/list" , function(request, response){
	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="select empno, ename,id,e.deptno,dname,loc";	
			sql+=" from emp e, dept d";
			sql+=" where e.deptno=d.deptno";

			con.query(sql, function(err, result, fields){
				if(err){
					console.log(err);
				}else{
					response.writeHead(200,{"Content-Type":"text/html"});
					response.end(JSON.stringify(result));
				}
				con.release();//반납
			});
		}
	});

});

server.listen(8888, function(){
	console.log("웹서버가 8888포트에서 실행중...");
});
