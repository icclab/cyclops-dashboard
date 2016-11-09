<a href="http://icclab.github.io/cyclops" target="_blank"><img align="middle" src="http://icclab.github.io/cyclops/assets/images/logo_big.png"></img></a>

## Dashboard
The **Cyclops Dashboard** is one of the support services as part of CYCLOPS - A Rating, Charging  & Billing solution for Cloud being developed by <a href="http://blog.zhaw.ch/icclab/">InIT Cloud Computing Lab</a> at <a href="http://www.zhaw.ch">ZHAW</a>. It is the place for users to check their usage data, connect to cloud providers and manage bills. Admins can use it to configure the different microservices and maintain user accounts. Dashboard interacts with the different micro service of <a href="http://icclab.github.io/cyclops">CYCLOPS</a>. The data for resource consumption visualisation is gathered by the interaction with <a href="https://github.com/icclab/cyclops/tree/master/core/udr">UDR microservice</a>. The configuration of rate policy and generated charge for a user is accessed by the Dashboard through that APIs of <a href="https://github.com/icclab/cyclops/tree/master/core/rc">RC microservice</a>.

### Features
Currently, the following features are implemented:

  * Authentication / Authorisation via Keystone
  * Dynamically created charts for usage data
  * Usage data over time details
  * Dynamically created charts for charge data
  * Charge data over time details
  * View billing information
  * Create bills for Tenants
  * Cyclops with OpenStack Event Collector
  * Cyclops with OpenStack Ceilometer Collector

### Limitations
Currently Cyclops Dashboard has the following limitations:

  * No Generic Authentication / Authorisation implemented
  * No support for Cyclops with CloudStack collector
  * No support for Cyclops with self-developed collectors
  * User information displayed in the landing page as well as in the bill are placeholders.

### Screenshot
<img align="middle" src="http://icclab.github.io/cyclops/assets/images/dashboard/dashboard-2-overview.png" alt="Dashboard screenshot" width="900"></img>

### Download
     $ git clone https://github.com/icclab/cyclops-dashboard.git

### Installation
In order to install the Dashboard you will only have to run the commands bellow:

     $ cd cyclops-dashboard/install
     $ chmod +x ./*

#### Dashboard
Then continue with Dashboard installation using following command, where you provide the same credentials as with Gatekeeper:

#### Configuration
 * Make sure you configure the Dashboard properly with the needed fields in the configuration file stored in cyclops-dashboard/conf/dashboard.conf

### Deployment
To start the Dashboard simply run the following command from the root folder:

     $ ./start.sh

All the output will be stored in cyclops-dashboard/nohup.out and whenever you want to stop the Dashboard the only needed command is:

	$ ./stop.sh


### Documentation
  Visit the <a href="https://github.com/icclab/cyclops-dashboard/wiki">Wiki</a> for detailed installation steps.
  
### Cyclops architecture
<img align="middle" src="http://icclab.github.io/cyclops/assets/images/architecture/arch_new.png" alt="CYCLOPS Architecture" width="800"></img>

### Bugs and issues
  To report any bugs or issues, please use <a href="https://github.com/icclab/cyclops-dashboard/issues">Github Issues</a>
  
### Communication
  * Email: icclab-rcb-cyclops[at]dornbirn[dot]zhaw[dot]ch
  * Website: <a href="http://icclab.github.io/cyclops" target="_blank">icclab.github.io/cyclops</a>
  * Blog: <a href="http://blog.zhaw.ch/icclab" target="_blank">http://blog.zhaw.ch/icclab</a>
  * Tweet us @<a href="https://twitter.com/ICC_Lab">ICC_Lab</a>
   
### Developed @
<img src="https://blog.zhaw.ch/icclab/files/2016/03/cropped-service_engineering_logo_zhawblue_banner.jpg" alt="ICC Lab" height="180" width="620"></img>


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
