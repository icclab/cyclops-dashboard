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

import ch.icclab.cyclops.dashboard.builder.KeystoneRequestBuilder;
import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import com.rabbitmq.tools.json.JSONReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.data.MediaType;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.*;

import java.io.IOException;


/**
 * This class handles all the requests necessary to associate a Keystone ID with a user profile
 */
public class KeystoneAssociation extends ServerResource {
    final static Logger logger = LogManager.getLogger(KeystoneAssociation.class.getName());

    @Post("json")
    public Representation getKeystoneUserId(Representation entity) {
        try {
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject requestJson = represent.getJsonObject();
            String username = requestJson.getString("username");
            String password = requestJson.getString("password");
            logger.debug("Attempting to get the Keystone Id");
            return sendRequest(username, password);
        } catch (Exception e) {
            logger.error("Error while getting the Keystone Id: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    @Put("json")
    public void storeKeystoneUserId(Representation entity) {
        try {
            JsonRepresentation representation = new JsonRepresentation(entity);
            JSONObject requestJSON = representation.getJsonObject();
            String username = requestJSON.getString("username");
            String keystoneId = requestJSON.getString("keystoneId");
            logger.trace("Attempting to store the Keystone Id in the database.");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            databaseHelper.addKeystoneId(username, keystoneId);
        } catch (Exception e) {
            logger.error("Error while storing the Keystone Id: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    private Representation findUserId(Representation rep) throws JSONException, IOException {
        JSONObject response = new JSONObject();
        JsonRepresentation jsonRep = new JsonRepresentation(rep);
        JSONObject wrapper = jsonRep.getJsonObject();
        logger.debug("Attempting to find a User Id");
        String id = wrapper
                .getJSONObject("token")
                .getJSONObject("user")
                .getString("id");
        response.put("keystoneId", id);
        return new JsonRepresentation(response);
    }

    private Representation sendRequest(String username, String pwd) throws JSONException, IOException {
        logger.debug("Attempting to get the Token");
        JsonRepresentation body = KeystoneRequestBuilder.buildKeystoneAuthRequestBody(username, pwd, "default");
        ClientResource clientResource = new ClientResource(LoadConfiguration.configuration.get("KEYSTONE_TOKEN_URL"));
        clientResource.setRequestEntityBuffering(true);
        return findUserId(clientResource.post(body, MediaType.APPLICATION_JSON));
    }
}
