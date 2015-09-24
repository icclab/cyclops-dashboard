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
import ch.icclab.cyclops.dashboard.oauth2.OAuthClientResource;
import ch.icclab.cyclops.dashboard.oauth2.OAuthServerResource;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;

/**
 * This class handles all requests associated with UDR meters. The class can load existing meter configuration and
 * update meter configuration on the UDR microservice
 */
public class UdrMeter extends OAuthServerResource {
    final static Logger logger = LogManager.getLogger(UdrMeter.class.getName());

    /**
     * This method updates the meter configuration from the UDR microservice
     * <p/>
     * The method receives the prepared request body from the dashboard frontend and sends it to the UDR Endpoint
     * configured in /WEB-INF/configuration.txt as UDR_METER_URL
     *
     * @param entity The incoming request from the dashboard frontend
     * @return A representation of the untouched response
     */
    @Post("json")
    public Representation updateUdrMeters(Representation entity) {
        try {
            logger.debug("Attempting to Update the UDR Meters.");
            String oauthToken = getOAuthTokenFromHeader();
            String url = LoadConfiguration.configuration.get("UDR_METER_URL");
            OAuthClientResource res = new OAuthClientResource(url, oauthToken);
            Representation rep = new JsonRepresentation(entity);
            return res.post(rep);
        } catch (Exception e) {
            logger.error("Error while updating the UDR Meters: " + e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }


    /**
     * This method requests the configured meters from the UDR microservice
     *
     * @return A representation of the untouched response
     */
    @Get
    public Representation getUdrMeters() {
        logger.debug("Attempting to Get the UDR Meters.");
        String oauthToken = getOAuthTokenFromHeader();
        String url = LoadConfiguration.configuration.get("UDR_METER_URL");
        OAuthClientResource res = new OAuthClientResource(url, oauthToken);
        return res.get();
    }
}
