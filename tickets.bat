@echo off
ECHO ---Ƽ�ϸ�ũ ��ũ��---
set /p id=�α��� �̸��� : 
set /p pw=�α��� ��й�ȣ : 
set /p prod=�ܼ�Ʈ ��ȣ : 
set sp=0;
set /p sp=���ϴ� ȸ�� (1~, �Է� ������ ��� ȸ��) : 
node index.js %id% %pw% %prod% %sp%