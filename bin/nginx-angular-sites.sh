#! /bin/sh
# /etc/init.d/angular-sites.sh

cd /var/angular-sites/
sudo ./bin/fastcgi.sh start &
sudo grunt nginx:start
exit 0
