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

package ch.icclab.cyclops.dashboard.token;

import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.data.Form;
import org.restlet.data.Header;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;
import org.restlet.util.Series;

/**
 * This class provides access to the OpenAM UserInfo endpoint
 */
public class TokenInfo extends ServerResource {
    final static Logger logger = LogManager.getLogger(TokenInfo.class.getName());

    /**
     * This method requests Token information from Gatekeeper.
     * <p>
     * The method receives an access token from the dashboard frontend. With this token, a request is sent to the
     * appropriate Gatekeeper endpoint configured as GK_TOKEN_INFO_URL. The response is then sent back to the dashboard.
     *
     * @return  A representation of the untouched response
     *
     */
    @Get
    public Representation userinfo(){
        logger.debug("Attempting to get the User Information.");
        Form query = getRequest().getResourceRef().getQueryAsForm();
        String stringQuery = query.getQueryString();
        String token = stringQuery.split("=")[1];
        Series<Header> requestHeaders = getRequest().getHeaders();

        ClientResource clientResource = new ClientResource(LoadConfiguration.configuration.get("GK_AUTH_TOKEN_INFO_URL") + token);
        Series<Header> headers = (Series<Header>) clientResource.getRequestAttributes().get("org.restlet.http.headers");

        if (headers == null) {
            headers = new Series<Header>(Header.class);
            clientResource.getRequestAttributes().put("org.restlet.http.headers", headers);
        }

        headers.set("X-Auth-Uid", requestHeaders.getFirstValue("x-auth-uid"));
        return clientResource.get();
    }
}
