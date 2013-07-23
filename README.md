# Angular Sites

This is a relatively new, project responsible for serving [AngularJS.org](http://angularjs.org) sites.

This project brings in the content of all sites via git submodules, placing each site in sites/site-repo. To edit a site directly, find its Github repo and make a PR.

This project uses [Nginx](http://nginx.org) to serve files and proxy a FastCGI process to execute some legacy PHP scripts.

End-to-end tests are all written using [Protractor](https://github.com/juliemr/protractor), a selenium-webdriver-powered test runner and library written for Angular apps, which makes it simple to script tests against Angular applications. Tests are organized in the tests directory according the site being tested, and may eventually be moved out of this repo into their respective sites' repos.

AngularJS.org sites are hosted on [Google Compute Engine](https://cloud.google.com/products/compute-engine).

## Prerequisites

 * *nix environment (Mac OS, Linux, etc)
 * [nginx echo module](http://wiki.nginx.org/HttpEchoModule)
 * [nginx 1.3.16+](http://nginx.org)
 * [node ~0.8](http://nodejs.org)
 * [OpenSSL](http://www.openssl.org/)
 * [php 5+](http://php.net/)
 * [pcre](http://www.pcre.org/)
 * [zlib]
 * [wget](http://www.gnu.org/software/wget/)
 * unzip
 * [grunt 0.4+](http://gruntjs.com) npm install -g grunt-cli

## Compiling Nginx

Because we're using the echo-nginx-module (installed via bower), nginx must be compiled manually. Using a standard distribution of nginx will cause the server to fail. After downloading the nginx source, and running bower install in this project's root directory, run the following commands:

    $ cd <nginx-source>/
    $ ./configure --add-module=/<project-root>/components/echo-nginx-module
    $ sudo make
    $ sudo make install

And then check that nginx was installed with the correct dependency:

    $ nginx -V //Output should include "echo-nginx-module"


## Setup (After Installing Nginx)

First, clone this project, and automatically pull down all of its submodules. This repo includes submodules of all angularjs.org sites to be served, placed in /sites.
    
    $ git clone --recursive https://github.com/angular/angular-sites.git
    $ cd angular-sites/
    $ npm install .
    
The next step, bower install installs selenium webdriver and chromedriver for mac. Skip this step if you'd rather manage those dependencies yourself. You'll also need to update protractorConf.js to use the right webdriver files, hosts, ports, etc.

    $ bower install . 
    
This step generates environment-specific configuration files. This makes sure that sites' files are served from the correct directory, and that tests are executed against the proper hosts.

This step can be used to configure tests to run against a remote environment. Configuring with prod will test all sites against their production domain (e.g. angularjs.org:80, docs.angularjs.org:80). Dev will configure nginx and tests to operate at dev.*:80 for all domains. Local (default) target will run and test all sites at:
 
 * :8000 (angularjs.org)
 * :8001 (builtwith.angularjs.org)
 * :8002 (docs.angularjs.org)
 * :8003 (code.angularjs.org)
 * :8004 (dashboard.angularjs.org)

Server restart is required after running configure in order for changes to take effect.

--target is optional, default=local.
    
    $ sudo grunt configure [--target=<dev | prod | local>]
    
Necessary step to generate a JSON representation of htacccess rewrite rules, in order to automatically test rewrite rules.
    
    $ grunt ht2j

## Server Administration

### Test nginx config

This just tests that the nginx configuration files are valid; does not run end-to-end tests on the sites. This should not be run before running `grunt configure`, as there will not yet be config files to test.

    $ sudo grunt nginx:test

### Start server
    
    $ sudo ./bin/fastcgi.sh start &
    $ sudo grunt nginx:start

### Stop server

    $ sudo ./bin/fastcgi.sh stop
    $ sudo grunt nginx:stop

### Gracefully restart server

Will keep old nginx process alive until done serving open connections, while spawning a new nginx process with updated config.

    $ sudo grunt nginx:restart

## Run end-to-end tests

__Note:__ When testing a remote environment locally, first run configure with the target environment set to the remote environment to be tested. E.g. sudo grunt configure --target=prod

The following command will start protractor, which will start selenium webdriver and chromedriver then begin executing end-to-end tests for all sites. The sites are expected to be running prior to starting tests.

    $ ./node_modules/.bin/protractor protractorConf.js

## Managing Logs

The access and error logs are generated within each site's nginx config, and are kept in logs/. It's recommended to use the logrotate utility to keep a short history of logs and to compress them. In the current production environment, the following configuration is provided in /etc/logrotate.d/nginx (replace /var/angular-sites with the actual path):

    /var/angular-sites/logs/*.log {
        daily
        missingok
        rotate 7
        size 5k
        dateext
        dateformat -%Y-%m-%d
        compress
        sharedscripts
        postrotate
                [ ! -f /var/angular-sites/nginx.pid ] || kill -USR1 `cat /var/angular-sites/nginx.pid`
        endscript
    }


You will also need to schedule cron to execute logrotate with this configuration once a day.
    
    $ sudo vi /etc/crontab
    0 01    * * *   root    /usr/sbin/logrotate /etc/logrotate.d/nginx > /dev/null 2>&1
