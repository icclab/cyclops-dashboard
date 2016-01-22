<a href="http://icclab.github.io/cyclops" target="_blank"><img align="middle" src="http://icclab.github.io/cyclops/assets/images/logo_big.png"></img></a>

## Dashboard
The **Cyclops Dashboard** is one of the support services as part of CYCLOPS - A Rating, Charging  & Billing solution for Cloud being developed by <a href="http://blog.zhaw.ch/icclab/">InIT Cloud Computing Lab</a> at <a href="http://www.zhaw.ch">ZHAW</a>. It is the place for users to check their usage data, connect to cloud providers and manage bills. Admins can use it to configure the different microservices and maintain user accounts. Dashboard interacts with the different micro service of <a href="http://icclab.github.io/cyclops">CYCLOPS</a>. The data for resource consumption visualisation is gathered by the interaction with <a href="https://github.com/icclab/cyclops-udr">UDR microservice</a>. The configuration of rate policy and generated charge for a user is accessed by the Dashboard through that APIs of <a href="https://github.com/icclab/cyclops-rc">RC microservice</a>.

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

### Screenshot
<img align="middle" src="http://icclab.github.io/cyclops/assets/images/dashboard/dashboard_menu.png" alt="Dashboard screenshot" height="331" width="900"></img>

### Download
     $ git clone https://github.com/icclab/cyclops-dashboard.git

### Installation
Make sure you've already installed <a href="https://github.com/icclab/cyclops-udr" target="_blank">UDR</a>, <a href="https://github.com/icclab/cyclops-rc" target="_blank">RC</a> and <a href="https://github.com/icclab/cyclops-billing" target="_blank">Billing</a> microservices, as Dashboard requires the same prerequisites. If you want to run these microservices on different machines, then just install UDR's prerequisites, without deploying others again. Then continue with commands below:

     $ cd cyclops-dashboard/install
     $ chmod +x ./*

#### Gatekeeper
First, will need to configure <a href="https://github.com/icclab/gatekeeper" target="_blank">Gatekeeper</a>, start with following command and **provide admin credentials** you want to use with your new Dashboard deployment.

     $ bash setup_gatekeeper.sh

Once Gatekeeper is fully installed and properly configured, it will automatically start listening. At any time in future, you can access it yourself via <code>auth_utils</code> command.

#### Dashboard
Then continue with Dashboard installation using following command, where you provide the same credentials as with Gatekeeper:

##### For OpenStack
     $ bash setup_for_openstack.sh
##### For CloudStack
     $ bash setup_for_cloudstack.sh

<b>Note</b>: Currently, it's not possible to have Dashboard deployment of OpenStack and CloudStack at the same time, please select just one of them.

#### Configuration
 * At the end of the installation process you will be asked for your deployment credentials and to modify any configuration parameters, **please do not ignore this step.**
 * If there is a need to update your configuration, you can find it stored here cyclops-dashboard/src/main/webapp/WEB-INF/configuration.txt

### Deployment
     $ bash deploy_dashboard.sh

In order to log in make sure Gatekeeper is running, then you can access Dashboard Web GUI over <code>http://vm-ip:8080/dashboard/app</code>

### Documentation
  Visit the <a href="https://github.com/icclab/cyclops-dashboard/wiki">Wiki</a> for detailed installation steps, how to tutorials, as well as OpenAM guide.
  
### Cyclops architecture
<img align="middle" src="http://blog.zhaw.ch/icclab/files/2013/05/overall_architecture.png" alt="CYCLOPS Architecture" height="500" width="600"></img>

### Bugs and issues
  To report any bugs or issues, please use <a href="https://github.com/icclab/cyclops-dashboard/issues">Github Issues</a>
  
### Communication
  * Email: icclab-rcb-cyclops[at]dornbirn[dot]zhaw[dot]ch
  * Website: <a href="http://icclab.github.io/cyclops" target="_blank">icclab.github.io/cyclops</a>
  * Blog: <a href="http://blog.zhaw.ch/icclab" target="_blank">http://blog.zhaw.ch/icclab</a>
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