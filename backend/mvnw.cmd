@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM Looks for Maven in the standard wrapper cache structure used by Spring Boot.
@REM ----------------------------------------------------------------------------
@SETLOCAL EnableExtensions EnableDelayedExpansion

@SET MVN_CMD=
@SET WRAPPER_DISTS=%USERPROFILE%\.m2\wrapper\dists

@REM Find any cached apache-maven under the wrapper dists folder
@FOR /D %%D IN ("%WRAPPER_DISTS%\apache-maven-*") DO (
  @FOR /D %%H IN ("%%D\*") DO (
    @FOR /D %%M IN ("%%H\apache-maven-*") DO (
      @IF EXIST "%%M\bin\mvn.cmd" SET MVN_CMD=%%M\bin\mvn.cmd
    )
  )
)

@IF DEFINED MVN_CMD GOTO :run

@REM No cached Maven — download 3.9.6
@SET DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
@SET DIST_FILE=%WRAPPER_DISTS%\apache-maven-3.9.6-bin.zip
@IF NOT EXIST "%WRAPPER_DISTS%" @MKDIR "%WRAPPER_DISTS%"
@ECHO Downloading Maven 3.9.6...
@powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%DIST_FILE%'; Expand-Archive -Path '%DIST_FILE%' -DestinationPath '%WRAPPER_DISTS%\apache-maven-3.9.6-bin\00000000' -Force; Remove-Item '%DIST_FILE%'"

@FOR /D %%D IN ("%WRAPPER_DISTS%\apache-maven-*") DO (
  @FOR /D %%H IN ("%%D\*") DO (
    @FOR /D %%M IN ("%%H\apache-maven-*") DO (
      @IF EXIST "%%M\bin\mvn.cmd" SET MVN_CMD=%%M\bin\mvn.cmd
    )
  )
)

:run
@IF NOT DEFINED MVN_CMD (
  @ECHO ERROR: Could not locate Maven. Check your .m2\wrapper\dists directory.
  @EXIT /B 1
)

@"%MVN_CMD%" %*
@ENDLOCAL
