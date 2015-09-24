/*
 * Copyright (c) 2015. Zuercher Hochschule fuer Angewandte Wissenschaften
 *  All Rights Reserved.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *     WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *     License for the specific language governing permissions and limitations
 *     under the License.
 */
package ch.icclab.cyclops.dashboard.keystone;

import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openstack4j.api.OSClient;
import org.openstack4j.model.identity.Token;
import org.openstack4j.openstack.OSFactory;
import org.restlet.resource.ClientResource;


/**
 * This class handles the use of Openstack4j
 */
public class KeystoneClient extends ClientResource {
    final static Logger logger = LogManager.getLogger(KeystoneClient.class.getName());

    /**
     * Generates the token from Keystone service of OpenStack.
     *
     * @return Generated token
     */
    public String generateToken(){
        logger.debug("Generating the Token");
        OSClient os = this.buildClient();
        Token token = os.getToken();
        logger.debug("Token Generated");
        return token.getId();
    }

    /**
     * This method builds an Openstack client using Openstack4j. This client can be used for several things.
     *
     * @return OpenStack Client
     */
    private OSClient buildClient(){
        String keystoneURL = LoadConfiguration.configuration.get("KeystoneURL");
        String keystoneUsername = LoadConfiguration.configuration.get("KeystoneUsername");
        String keystonePassword = LoadConfiguration.configuration.get("KeystonePassword");
        String keystoneTenantName = LoadConfiguration.configuration.get("KeystoneTenantName");
        logger.trace("Attempting to Create the OpenStack Client");
        OSClient os = OSFactory.builder()
                .endpoint(keystoneURL)
                .credentials(keystoneUsername, keystonePassword)
                .tenantName(keystoneTenantName)
                .authenticate();
        logger.trace("OpenStack Client created.");
        return os;
    }
}
