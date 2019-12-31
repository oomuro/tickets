@echo off
ECHO ---티켓링크 매크로---
set /p id=로그인 이메일 : 
set /p pw=로그인 비밀번호 : 
set /p prod=콘서트 번호 : 
set sp=0;
set /p sp=원하는 회차 (1~, 입력 없으면 모든 회차) : 
node index.js %id% %pw% %prod% %sp%