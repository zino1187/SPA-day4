# SPA-day4
코리아정보보안 프런트 개발자 오전 2018-08-26
drop datbase front; 

create database front;

create table dept(
	deptno int primary key auto_increment
	, dname varchar(20)
	, loc varchar(20)
) default character set utf8;

create table  emp(
	 empno int primary key auto_increment
	, ename varchar(20)
	, id varchar(20)
	, deptno int
) default character set utf8;

insert into dept(dname,loc) values('영업','서울');
insert into dept(dname,loc) values('리서치','대전');
insert into dept(dname,loc) values('회계','인천');
insert into dept(dname,loc) values('인사','광주');
