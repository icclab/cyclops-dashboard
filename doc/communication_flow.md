# Communication Flow beween Dashboard and Microservice

## Overview

The communication flow between the dashboard and microservices begins with the user logging into the dashboard. The user submits his credentials to the dashboard. (It is highly recommended to use SSL-protected connections to protect the user's password)

![](https://github.com/icclab/cyclops-support/blob/master/dashboard/doc/images/dashboard_udr.jpg)

In step 2, the dashboard uses the credentials to request an access token from OpenAM, which will be returned if the credentials are valid (step 3). Using this access token, the dashboard can then request data from the UDR microservice, as seen in step 4.

Before the UDR service returns any data, it needs to make sure that the user is authorised to make requests and access the requested data. To do this, it has to first validate the token with OpenAM (step 5 + 6). OpenAM answers with the token validity. Only if the token is valid will the UDR microservice send back the data to the dashboard.

## Detailed Description

1. The end user provides his credentials to the dashboard

1. Using the provided credentials, the dashboard requests an access token from OpenAM

1. Assuming the user credentials were correct, OpenAM returns an access token that will enable the dashboard to request data from the UDR microservice on behalf of the end user

1. The dashboard asks for the user's usage data. For this, it sends the cloud provider ID (identifying the user's cloud provider account) and the access token to the UDR microservice

1. To make sure the request is valid, the UDR microservice needs to make sure that an authorised user sent it. The microservice sends the access token to OpenAM, which will respond in the next step

1. OpenAM decides whether or not the access token is valid. Additionally, it will send back the cloud provider ID associated with this access token. (Note: Reading user information is a feature from OpenID Connect)

1. The UDR microservice makes sure that the cloud provider ID from the dashboard (step 4) matches the ID from OpenAM (step 6). This is important to make sure that the end user did not try to read data from another user.

1. Only if the access token is valid and the cloud provider IDs match, the UDR microservice will return the usage data

1. The dashboard presents the usage data to the end user