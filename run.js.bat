@if(0)==(0) echo off
cscript //nologo /E:JScript "%~f0" %*
goto :EOF
@end

var shell = WScript.CreateObject("WScript.Shell")
shell.Run( "npm start", 7);
shell = null;
