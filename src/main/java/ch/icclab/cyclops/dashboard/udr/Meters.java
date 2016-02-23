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

package ch.icclab.cyclops.dashboard.udr;

import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.load.Loader;
import ch.icclab.cyclops.dashboard.oauth2.OAuthClientResource;
import ch.icclab.cyclops.dashboard.oauth2.OAuthServerResource;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;

import java.util.Map;

/**
 * This class handles all requests associated with UDR meters. The class can load existing meter configuration and
 * update meter configuration on the UDR microservice
 */
public class Meters extends OAuthServerResource {
    final static Logger logger = LogManager.getLogger(Meters.class.getName());

    /**
     * This method requests the configured meters from the UDR microservice
     *
     * @return A representation of the untouched response
     */
    @Get
    public Representation getUdrMeters() {
        logger.debug("Attempting to Get the Custom-Environment UDR Meters.");
        String oauthToken = getOAuthTokenFromHeader();
        String url = Loader.getSettings().getCyclopsSettings().getUdr_envirionment_meter_url();
        OAuthClientResource res = new OAuthClientResource(url, oauthToken);
        return res.get();
    }
}
