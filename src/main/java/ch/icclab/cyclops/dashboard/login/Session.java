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

package ch.icclab.cyclops.dashboard.login;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.restlet.data.Header;
import org.restlet.data.MediaType;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;
import org.restlet.util.Series;

/**
 * This class is responsible for requests that handle OpenAM Sessions
 */
public class Session extends ServerResource {
    final static Logger logger = LogManager.getLogger(Session.class.getName());

    /**
     * This method requests an authorization to Gatekeeper
     *
     * @param entity The incoming request from the dashboard frontend containing username and password
     * @return A representation of the untouched response
     */
    @Post("json")
    public Representation login(Representation entity) {
        try {
            logger.debug("Attempting to login.");
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject json = represent.getJsonObject();
            String user = json.getString("username");
            String pass = json.getString("password");
            return sendRequest(user, pass);
        } catch (Exception e) {
            logger.error("Error while Loging in: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    /**
     * This method does the proper request to the gatekeeper
     *
     * @param username
     * @param password
     * @return
     * @throws Exception
     */
    private Representation sendRequest(String username, String password) throws Exception {
        logger.trace("Attempting to get the UserId from the database.");
        DatabaseHelper databaseHelper = new DatabaseHelper();
        String userId = databaseHelper.getUserId(username);
        logger.debug("Attempting to get authorization from the Gatekeeper.");
        ClientResource res = new ClientResource(LoadConfiguration.configuration.get("GK_AUTH_URL") + userId);
        Series<Header> headers = (Series<Header>) res.getRequestAttributes().get("org.restlet.http.headers");

        if (headers == null) {
            headers = new Series<Header>(Header.class);
            res.getRequestAttributes().put("org.restlet.http.headers", headers);
        }
        String hash = DigestUtils.sha1Hex(password);
        headers.set("X-Auth-Password", hash);
        return res.get(MediaType.APPLICATION_JSON);
    }
}
