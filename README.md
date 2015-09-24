# cyclops-support

The **Cyclops Dashboard** is one of the support services as part of CYCLOPS - A Rating, Charging  & Billing solution for cloud being developed by <a href="http://blog.zhaw.ch/icclab/">InIT Cloud Computing Lab</a> at <a href="http://www.zhaw.ch">ZHAW</a>

It is the place for users to check their usage data, connect to cloud providers and manage bills. Admins can use it to configure the different microservices and maintain user accounts.

The dashboard interacts with the different micro service of <a href="http://icclab.github.io/cyclops">CYCLOPS</a>. The data for resource consumption visualization is gathered by the interaction with <a href="https://github.com/icclab/cyclops-udr">Usage Data Records Micro Service</a>. The coonfiguration of rate policy and generated charge for a user is accessed by the dashboard through that APIs of <a href="https://github.com/icclab/cyclops-rc">Rate & Charge Micro Service</a>.   

![](https://github.com/icclab/cyclops-support/blob/master/dashboard/doc/images/dashboard_menu.png)

### Architecture
#### * CYCLOPS Rating Charging & Billing Framework
<img align="middle" src="http://blog.zhaw.ch/icclab/files/2013/05/overall_architecture.png" alt="CYCLOPS Architecture" height="500" width="600"></img>

### Installation
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

For more in-depth documentation, see:
* [Installing OpenAM](https://github.com/icclab/cyclops-support/wiki/Dashboard-Installation)
* [Configuring OpenAM](https://github.com/icclab/cyclops-support/wiki/OpenAM-Configuration)
* [Communication Flow](https://github.com/icclab/cyclops-support/wiki/Communication-Flow)
* [Javadoc](https://icclab.github.io/cyclops/javadoc/dashboard/)
* [Development Environment](https://github.com/icclab/cyclops-support/wiki/Setting-Up-Development-Environment)
* [Directory Structure](https://github.com/icclab/cyclops-support/wiki/Directory-Structure)

### Features
Currently, the following features are implemented:
  * [User] Authentication / Authorisation via OpenAM
  * [User] Linking an account to OpenStack
  * [User] Dynamically created charts for usage data
  * [User] Dynamically created charts for rate data
  * [User] Dynamically created charts for charge data
  * [User] Alert Messages
  * [User] Charts for external meters
  * [User] View billing information and bill PDFs
  * [Admin] Listing users and admins
  * [Admin] Displaying list of all available meters
  * [Admin] Configuring UDR Microservice to use different set of meters
  * [Admin] User Management
  * [Admin] Configure Rate Microservice
  * [Admin] Create bills for users
  * [Admin] Add external meters

### Components & Libraries
  * <a href="https://angularjs.org">AngularJS</a>
  * <a href="https://github.com/angular-ui/ui-router">AngularJS ui-router</a>
  * <a href="https://github.com/Salakar/angular-toasty">angular-toasty</a>
  * <a href="https://github.com/chieffancypants/angular-loading-bar">angular-loading-bar</a>
  * <a href="https://angular-ui.github.io/bootstrap/">angular-ui bootstrap</a>
  * <a href="https://github.com/datejs/Datejs">DateJS</a>
  * <a href="http://d3js.org/">D3</a>
  * <a href="http://nvd3.org/">NVD3</a>
  * <a href="https://krispo.github.io/angular-nvd3/">angular-NVD3</a>
  * <a href="https://jasmine.github.io">Jasmine</a>
  * <a href="http://getbootstrap.com">Bootstrap</a>
  * <a href="http://startbootstrap.com/template-overviews/sb-admin-2">SB Admin 2 (Bootstrap Theme)</a>
  * <a href="https://tomcat.apache.org">Tomcat7</a>
  * <a href="https://restlet.com">RESTLET</a> 

### Communication
  * Issues/Ideas/Suggestions : <a href="https://github.com/icclab/cyclops-support/issues">GitHub Issue</a>
  * Website : http://blog.zhaw.ch/icclab/ 
  * Tweet us @<a href="https://twitter.com/ICC_Lab">ICC_Lab</a>
   
### Developed @
<img src="http://blog.zhaw.ch/icclab/files/2014/04/icclab_logo.png" alt="ICC Lab" height="180" width="620"></img>

### License
 
      Licensed under the Apache License, Version 2.0 (the "License"); you may
      not use this file except in compliance with the License. You may obtain
      a copy of the License at
 
           http://www.apache.org/licenses/LICENSE-2.0
 
      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
      WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
      License for the specific language governing permissions and limitations
      under the License.
