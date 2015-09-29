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

package ch.icclab.cyclops.dashboard.charge;

import ch.icclab.cyclops.dashboard.oauth2.OAuthClientResource;
import ch.icclab.cyclops.dashboard.oauth2.OAuthServerResource;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;

public class Charge extends OAuthServerResource {
    final static Logger logger = LogManager.getLogger(Charge.class.getName());

    @Get
    public Representation getCharge() {
        String query = getRequest().getResourceRef().getQuery();
        String oauthToken = getOAuthTokenFromHeader();
        String url = LoadConfiguration.configuration.get("RC_CHARGE_URL") + "?" + query;
        OAuthClientResource clientResource = new OAuthClientResource(url, oauthToken);
        logger.debug("Attempting to get the Charges.");
        return clientResource.get();
    }
}