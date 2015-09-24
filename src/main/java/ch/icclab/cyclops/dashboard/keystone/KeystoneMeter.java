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

import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.restlet.resource.ClientResource;
import org.restlet.resource.ServerResource;
import org.restlet.data.Header;
import org.restlet.data.MediaType;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;
import org.restlet.resource.ResourceException;
import org.restlet.util.Series;


/**
 * This class handles all the requests handling keystone meters
 */
public class KeystoneMeter extends ServerResource {
    final static Logger logger = LogManager.getLogger(KeystoneMeter.class.getName());

    /**
     * This method loads all the meters from all the users from keystone.
     *
     * @return  A representation of the untouched response
     */
    @Get
    public Representation getKeystoneMeters() {

        try {
            String meterUrl = LoadConfiguration.configuration.get("KEYSTONE_METERS_URL");// + "?q.field=user_id&q.value=x";

            ClientResource meterResource = new ClientResource(meterUrl);


            Series<Header> requestHeaders =
                    (Series<Header>) meterResource.getRequestAttributes().get("org.restlet.http.headers");

            if (requestHeaders == null) {
                requestHeaders = new Series<Header>(Header.class);
                meterResource.getRequestAttributes().put("org.restlet.http.headers", requestHeaders);
            }

            KeystoneClient keystoneClient = new KeystoneClient();
            logger.trace("Attempting to create the token");
            String subjectToken = keystoneClient.generateToken();

            requestHeaders.set("X-Auth-Token", subjectToken);

            return meterResource.get(MediaType.APPLICATION_JSON);

        } catch (Exception e) {
            logger.error("Error while getting the Keystone Meters: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}
