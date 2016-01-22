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
package ch.icclab.cyclops.dashboard.services.iaas.cloudstack.keystone;

import ch.icclab.cyclops.dashboard.load.Loader;
import ch.icclab.cyclops.dashboard.oauth2.OAuthClientResource;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

/**
 * @author Manu
 *         Created on 20.11.15.
 */
public class EmptyKeystoneMeter extends ServerResource {
    final static Logger logger = LogManager.getLogger(EmptyKeystoneMeter.class.getName());

    /**
     * This method loads all the meters from all the users from keystone.
     *
     * @return A representation of the untouched response
     */
    @Get
    public Representation getKeystoneMeters() {
        logger.debug("Attempting to Get the UDR Meters.");
        String url = Loader.getSettings().getCyclopsSettings().getUdr_meter_url();
        ClientResource clientResource = new ClientResource(url);
        return clientResource.get();
    }
}
