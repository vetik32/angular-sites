# ng-sites (In-Development)
One-stop deployment of angularjs.org sites.

## Prerequisites

 * Unixy environment (Mac OS, Linux, etc)
 * [Selenium Web Server](https://code.google.com/p/selenium/downloads/list)
 * [chrome driver](https://code.google.com/p/chromedriver/downloads/list)
 * [nginx 1.3.16+](http://nginx.org)
 * [node 0.8+](http://nodejs.org)
 * [php 5+](http://php.net/)
 * [grunt 0.4+](http://gruntjs.com) npm install -g grunt-cli

## Quickstart

(this repo includes submodules of all angularjs.org sites to be served)

    ## Setup
    $ git clone --recursive https://github.com/jeffbcross/ng-sites.git
    $ cd ng-sites/
    $ npm install .
    $ grunt configure

    ## Start server
    $ ./bin/fastcgi.sh
    $ nginx -c `pwd`/server/config/nginx.conf
    
    ## Start selenium server and run tests
    $ java -jar path/to/selenium-server-standalone.jar -Dwebdriver.chrome.driver=/path/to/chromedriver/binary
    $ grunt test

## TODO

  * Replace hard-coded path in fastcgi.sh
  * Finish writing tests
  * Support dynamic environment execution in tests (e.g. dev.*)
  * Create grunt tasks to manage nginx process
  * Create grunt task to check dependencies (php, nginx, selenium, chromedriver);
  * Reduce need for positional CSS selection in angularjs.org tests (e.g. :first-child, :nth-child)