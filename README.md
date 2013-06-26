# Angular Sites
One-stop deployment of angularjs.org sites.

## Prerequisites

 * *nix environment (Mac OS, Linux, etc)
 * [nginx 1.3.16+](http://nginx.org)  - compile with --add-module=/path/to/echo-nginx-module (in components/)
 * [node 0.8+](http://nodejs.org)
 * [OpenSSL](http://www.openssl.org/)
 * [php 5+](http://php.net/)
 * [pcre](http://www.pcre.org/)
 * [zlib]
 * [wget](http://www.gnu.org/software/wget/)
 * unzip
 * [grunt 0.4+](http://gruntjs.com) npm install -g grunt-cli

## Setup

This repo includes submodules of all angularjs.org sites to be served.
    $ git clone --recursive https://github.com/angular/angular-sites.git
    $ cd ng-sites/
    $ npm install .
    $ bower install .
    $ sudo grunt configure [--target=<dev | prod | local>]
    (default 'local', sets proper ports and domains for hosts. Only applied to sites hosted on this instance, e.g. not blog. or ci.)
    $ grunt ht2j

## Test nginx config

    $ sudo grunt server:test

## Start server
    
    $ sudo ./bin/fastcgi.sh start
    $ sudo grunt server:start #alias to sudo nginx -c path/to/conf
    
## Start selenium server and run tests

__Note:__ When testing a remote environment locally, first run configure with the target environment set to the remote environment to be tested. E.g. sudo grunt configure --target=prod

    $ grunt test

## Gracefully restart server

Will keep old nginx process alive until done serving open connections, while spawning a new nginx process with updated config.

    $ sudo grunt server:restart

## Stop server

    $ sudo ./bin/fastcgi.sh stop
    $ sudo grunt server:stop

## Managing Logs
The access and error logs are generated within each site's nginx config, and are kept in logs/. It's recommended to use the logrotate utility to keep a short history of logs and to compress them. In the current production environment, the following configuration is provided in /etc/logrotate.d/nginx:

    /var/angular-sites/logs/*.log {
        daily
        missingok
        rotate 7
        size 5k
        dateext
        dateformat -%Y-%m-%d
        compress
        sharedscripts
    }

## TODO

  * Reduce need for positional CSS selection in angularjs.org tests (e.g. :first-child, :nth-child)
