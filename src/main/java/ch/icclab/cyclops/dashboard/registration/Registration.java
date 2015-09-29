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
package ch.icclab.cyclops.dashboard.registration;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;

import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Put;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;


/**
 * @author Manu
 */
public class Registration extends ServerResource {
    final static Logger logger = LogManager.getLogger(Registration.class.getName());

    /**
     * This method inserts into the dashboard_users table a new User.
     *
     * @param entity
     * @throws ResourceException
     */
    @Put("json")
    public void registerUser(Representation entity) throws ResourceException {
        try {
            logger.debug("Attempting to register a new user.");
            JsonRepresentation representation = new JsonRepresentation(entity);
            JSONObject jsonObject = representation.getJsonObject();
            String username = jsonObject.getString("username");
            String password = jsonObject.getString("password");
            String name = jsonObject.getString("name");
            String surname = jsonObject.getString("surname");
            String email = jsonObject.getString("email");
            String admin = "n";//jsonObject.getString("admin");

            //Hashing the password
            String passwordHash = DigestUtils.sha1Hex(password);
            JsonRepresentation postResponse = new JsonRepresentation(createGKUser(username, passwordHash, admin));
            logger.trace("User created correctly in the Gatekeeper.");
            JSONObject response = postResponse.getJsonObject();
            String info = response.getString("info");
            String[] splitted = info.split("\"");
            String userId = splitted[3];
            userId = userId.split("/auth/")[1];
            logger.trace("Attempting to store the new user in the database.");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            databaseHelper.registerUser(username, passwordHash, name, surname, email, admin);
            databaseHelper.registerOnGK(username, passwordHash, userId);
        } catch (Exception e) {
            logger.error("Error while registering a new User: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    public Representation createGKUser(String username, String password, String isAdmin) throws JSONException {
        logger.debug("Attempting to create a new user into the Gatekeeper.");
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username", username);
        jsonObject.put("password", password);
        jsonObject.put("isadmin", isAdmin);
        jsonObject.put("accesslist", "ALL");
        ClientResource clientResource = new ClientResource(LoadConfiguration.configuration.get("GK_GET_UID"));
        return clientResource.post(jsonObject);
    }
}
