# ng-sites (In-Development)
One-stop deployment of angularjs.org sites.

## Prerequisites

 * *nix environment (Mac OS, Linux, etc)
 * [Selenium Web Server](https://code.google.com/p/selenium/downloads/list)
 * [chrome driver](https://code.google.com/p/chromedriver/downloads/list)
 * [nginx 1.3.16+](http://nginx.org)
 * [node 0.8+](http://nodejs.org)
 * [php 5+](http://php.net/)
 * [wget](http://www.gnu.org/software/wget/)
 * unzip
 * [grunt 0.4+](http://gruntjs.com) npm install -g grunt-cli

## Quickstart

(this repo includes submodules of all angularjs.org sites to be served)

    ## Setup
    $ git clone --recursive https://github.com/angular/angular-sites.git
    $ cd ng-sites/
    $ npm install .
    $ sudo grunt configure [--target=<dev | prod | local>] #default 'local', sets proper ports and domains for hosts. Only applied to sites hosted on this instance, e.g. not blog. or ci.
    $ grunt ht2j

    ## Start server
    $ sudo ./bin/fastcgi.sh start
    $ sudo ./bin/start.sh #starts nginx
    
    ## Start selenium server and run tests
    $ java -jar path/to/selenium-server-standalone.jar -Dwebdriver.chrome.driver=/path/to/chromedriver/binary
    $ grunt test

    ## Stop server
    $ sudo ./bin/fastcgi.sh stop
    $ sudo ./bin/stop.sh

## TODO

  * Reduce need for positional CSS selection in angularjs.org tests (e.g. :first-child, :nth-child)
