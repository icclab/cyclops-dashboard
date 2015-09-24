# Dashboard Backend (Java)
## Setting up the IDE for .war file deployment

The IDE used for this project is IntelliJ, but similar setups should be possible with other IDEs. For IntelliJ, follow these steps:

1. Choose _Run_ --> _Edit Configurations_

1. From the "+" menu, choose _Tomcat Server_ --> _Remote_
![](https://github.com/icclab/cyclops-support/blob/develop/dashboard/doc/images/intellij_new_remote_tomcat.png)

1. I was using the following _Server_ settings:
![](https://github.com/icclab/cyclops-support/blob/develop/dashboard/doc/images/intellij_tomcat_config.png)

1. For the _remote staging host_, the following settings have been used:
![](https://github.com/icclab/cyclops-support/blob/develop/dashboard/doc/images/intellij_tomcat_deployment_config.png)

# Dashboard (AngularJS)
## Editor / IDE / Setup
Any Text Editor or IDE can be used to edit the project. No specific requirements exist.

## Unit Test Runner
Unit Tests are written in JavaScript with the Jasmine testing framework. Any test runner can be used, but the recommended one is _Karma_.

![](https://github.com/icclab/cyclops-support/blob/develop/dashboard/doc/images/dashboard_test_runner.png)

It supports different plugins (headless browser, chrome, firefox, test coverage, ...) and is easy to set up. Check [https://karma-runner.github.io/0.12/intro/installation.html](the official GitHub page) for installation instructions. When using karma, the configuration files are already provided in the directory _web/app-test_ of this project.

![](https://github.com/icclab/cyclops-support/blob/develop/dashboard/doc/images/dashboard_test_runner_config.png)