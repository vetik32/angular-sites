#!/bin/bash
BIND=127.0.0.1:9000
USER=`whoami`
PHP_FCGI_CHILDREN=15
PHP_FCGI_MAX_REQUESTS=1000

PHP_CGI=`which php5-cgi`
if [ -n $PHP_CGI ]
then
  PHP_CGI=`which php-cgi`
fi

PHP_CGI_NAME=`basename $PHP_CGI`
RETVAL=0

start() {
      echo -n "Starting PHP FastCGI: "
      USER=$USER PHP_FCGI_CHILDREN=$PHP_FCGI_CHILDREN PHP_FCGI_MAX_REQUESTS=$PHP_FCGI_MAX_REQUESTS $PHP_CGI -b $BIND
      RETVAL=$?
      echo "$PHP_CGI_NAME."
}
stop() {
      echo -n "Stopping PHP FastCGI: "
      killall -q -w -u $USER $PHP_CGI
      RETVAL=$?
      echo "$PHP_CGI_NAME."
}

case "$1" in
    start)
      start
  ;;
    stop)
      stop
  ;;
    restart)
      stop
      start
  ;;
    *)
      echo "Usage: php-fastcgi {start|stop|restart}"
      exit 1
  ;;
esac
exit $RETVAL