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
package ch.icclab.cyclops.dashboard.gatekeeper;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.data.Header;
import org.restlet.data.MediaType;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.ResourceException;
import org.restlet.util.Series;

/**
 * This class handles the communication with the Gatekeeper
 */
public class GatekeeperTokenGenerator {
    final static Logger logger = LogManager.getLogger(GatekeeperTokenGenerator.class.getName());

    /**
     * This method returns a representation with the token information gotten from the gatekeeper
     * @param username
     * @param password
     * @return
     */
    public Representation getGatekeeperToken(String username, String password){
        try {
            DatabaseHelper databaseHelper = new DatabaseHelper();
            logger.trace("Attempting go get the userId from the database.");
            String userId = databaseHelper.getUserId(username);
            logger.debug("Attempting to get the token from the Gatekeeper.");
            ClientResource clientResource = new ClientResource(LoadConfiguration.configuration.get("GK_TOKEN_URL"));
            Series<Header> headers = (Series<Header>) clientResource.getRequestAttributes().get("org.restlet.http.headers");

            if (headers == null) {
                headers = new Series<Header>(Header.class);
                clientResource.getRequestAttributes().put("org.restlet.http.headers", headers);
            }

            headers.set("X-Auth-Password", password);
            headers.set("X-Auth-Uid", userId);

            return clientResource.post(MediaType.APPLICATION_JSON);
        }catch (Exception e) {
            logger.error("Error while getting the token from the Gatekeeper: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}
