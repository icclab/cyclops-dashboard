# Configuring OpenAM

Login to OpenAM (e.g. https://openam.example.com/openam) with the user 'amadmin' and the password chosen during the installation.

![](https://github.com/icclab/cyclops-support/blob/master/dashboard/doc/images/openam_tabs.png)

Most configuration will be done in the "Access Control" tab. A lot of additional configuration will be possible, but only the necessary steps are listed here. In the "Access Control" tab, choose the default realm to get started.

## Services

First, we have to set up the required services. To add a new service, click on the "add" button and select the service name:

* **User Self Service**: Users should be able to register, therefore we have to select "Self-Registration for Users". If users should be able to reset a forgotten password, check "Forgot Password for Users"

* **E-Mail Service**: The registration sends automated E-Mail. For this, a mail server needs to be configured. Gmail, for instance, uses hostname=smtp.gmail.com and port=465. Authentication username and password are the credentials for the GMail account to be used.

* **OAuth2 Provider**: Most default settings can be used. Only in the "Supported Claims" list you need to add 3 additional values: _keystoneid_, _isMemberOf_, _memberOf_

Save the changes at the top

## Agents

Choose the sub-tab **OAuth 2.0/OpenID Connect Client**. Add a new agent. You can choose any desired name and password (Note: These credentials later need to be configured in the **/WEB-INF/configuration.txt** file as OAUTH_CLIENT_NAME and OAUTH_CLIENT_PASS). After saving, you will be redirected back to the Agent overview.

Click on the newly created Agent name to access the configuration page. In the "Scope(s)" list, add the following entries: _openid_, _profile_, _keystoneid_, _memberOf_, _isMemberOf_

![](https://github.com/icclab/cyclops-support/blob/master/dashboard/doc/images/openam_agent_scopes.png)

Save your settings at the top

## Subjects

Choose the sub-tab _Group_ and create a new group called _CyclopsAdmin_.

## Privileges

Choose the _CyclopsAdmin_ group to change its privileges as follows:

![](https://github.com/icclab/cyclops-support/blob/master/dashboard/doc/images/openam_group_privileges.png)

## Custom Profile Attribute

Additionally to the in-OpenAM configuration, a new profile attribute needs to be added. Following the [official guide](http://docs.forgerock.org/en/openam/12.0.0/dev-guide/index/chap-custom-attr.html), an **optional** attribute called **keystoneid** needs to be added for the dashboard to store an OpenStack Keystone User ID. Note that later versions of the installation script will automate this step.

Note: **Do not restart Tomcat until you have finished all three steps**