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

package ch.icclab.cyclops.dashboard.services.iaas.openstack.keystone;

import ch.icclab.cyclops.dashboard.services.iaas.openstack.builder.KeystoneRequestBuilder;
import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.load.Loader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.data.MediaType;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.representation.StringRepresentation;
import org.restlet.resource.*;

import java.io.IOException;


/**
 * This class handles all the requests necessary to associate a Keystone ID with a user profile
 */
public class KeystoneAssociation extends ServerResource {
    final static Logger logger = LogManager.getLogger(KeystoneAssociation.class.getName());

    @Post("json")
    public String getKeystoneUserId(Representation entity) {
        try {
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject requestJson = represent.getJsonObject();
            String username = requestJson.getString("username");
            String password = requestJson.getString("password");
            logger.debug("Attempting to get the Keystone Id");
            KeystoneClient keystoneClient = new KeystoneClient();
            String keystoneId = keystoneClient.getKeystoneId(username, password);
            JSONObject response = new JSONObject();
            response.put("keystoneId", keystoneId);
            return response.toString();
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
}
