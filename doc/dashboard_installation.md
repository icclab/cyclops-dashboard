## Requirements
* OpenAM relies on Cookies and therefore needs to be accessible by a domain name. An IP alone will not work.
* OpenAM requires the following TCP ports: **1689**, **4444**, **50389**
* Tomcat requires the following TCP ports: **8080**, **8443**

## Installation
To install OpenAM, an installation distribution including a setup script can be downloaded (see below). Please note that the installation script is not fully automated yet. Some user input during installation is necessary. After the setup script is done, some further OpenAM configuration needs to be done by hand. In the future, the script is planned to be fully automatic.

**Note: If the installation of OpenAM or startup of Tomcat take extremely long, the problem might be that Tomcat is using /dev/random for random data. When there is not enough random data available, Tomcat will block. See [this blog post](http://www.leonli.co.uk/blog/739/tomcat-7-hangsfreezes-while-starting-in-ubuntu-14-04) for a possible workaround**

Step-by-step installation:

1. Check out this repository
1. Switch to the installation directory: `cd path/to/repository/dashboard/installation`
1. Make sure the hosts-file contains a route to localhost, otherwise OpenAM setup will fail
  1. execute `cat /etc/hosts | grep $HOSTNAME`
  1. it should output a line similar to `127.0.0.1 localhost myhostname`
  1. If it doesn't, run this as root: `echo "127.0.0.1 myhostname" >> /etc/hosts`
1. Make the installation script executable: `sudo chmod +x install.sh`
1. Run the installation script as root: `sudo ./install.sh`
1. Follow the script instructions
1. Wait for the setup to complete
1. Follow the [configuration guide](https://github.com/icclab/cyclops-support/wiki/OpenAM-Configuration) to finish setting up OpenAM