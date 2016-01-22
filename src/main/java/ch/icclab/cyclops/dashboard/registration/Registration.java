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
import ch.icclab.cyclops.dashboard.gatekeeper.GatekeeperTokenGenerator;
import ch.icclab.cyclops.dashboard.load.Loader;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.data.Header;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Put;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;
import org.restlet.util.Series;

import java.io.IOException;


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
            String[] splitted = info.split("\"id\":\"");
            String userId = splitted[1].split("\"")[0];
            logger.trace("Attempting to store the new user in the database.");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            databaseHelper.registerUser(username, passwordHash, name, surname, email, admin);
            databaseHelper.registerOnGK(username, passwordHash, userId);
        } catch (Exception e) {
            logger.error("Error while registering a new User: " + e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    public Representation createGKUser(String username, String password, String isAdmin) throws JSONException {
        logger.debug("Attempting to create a new user into the Gatekeeper.");
        GatekeeperTokenGenerator tokenGenerator = new GatekeeperTokenGenerator();
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username", username);
        jsonObject.put("password", password);
        jsonObject.put("isadmin", isAdmin);
        jsonObject.put("accesslist", "ALL");
        ClientResource clientResource = new ClientResource(Loader.getSettings().getCyclopsSettings().getGk_get_uid());

        try {
            logger.debug("Attempting to get the token to create the new user into Gatekeeper.");
            String gatekeeperAdmin = Loader.getSettings().getCyclopsSettings().getGk_admin();
            String gatekeeperPassword = Loader.getSettings().getCyclopsSettings().getGk_password();
            Representation representation = tokenGenerator.getGatekeeperToken(gatekeeperAdmin, gatekeeperPassword);
            JsonRepresentation jsonRepresentation = null;
            jsonRepresentation = new JsonRepresentation(representation);
            JSONObject repJsonObject = jsonRepresentation.getJsonObject();
            String tokenId = repJsonObject.getString("token").substring(7, 43);
            Series<Header> headers = (Series<Header>) clientResource.getRequestAttributes().get("org.restlet.http.headers");
            if (headers == null) {
                headers = new Series<Header>(Header.class);
                clientResource.getRequestAttributes().put("org.restlet.http.headers", headers);
            }
            headers.set("X-Auth-Token", tokenId);
        } catch (IOException e) {
            logger.error("Error while creating the token into GateKeeper: " + e.getMessage());
        }
        return clientResource.post(jsonObject);
    }

    public void registerAdmin() {
        try {
            logger.debug("Attempting to create the Default Admin Account.");
            String username = Loader.getSettings().getCyclopsSettings().getDashboard_admin();
            String password = Loader.getSettings().getCyclopsSettings().getDashboard_password();
            String name = "Admin";
            String surname = "Default Account";
            String email = "admin@default.ch";
            String admin = "y";
            DatabaseHelper databaseHelper = new DatabaseHelper();
            //Hashing the password
            String passwordHash = DigestUtils.sha1Hex(password);
            Representation representation = createDashboardAdmin(username, passwordHash);
            if (representation != null) {
                JsonRepresentation postResponse = new JsonRepresentation(representation);
                logger.trace("User created correctly in the Gatekeeper.");
                JSONObject response = postResponse.getJsonObject();
                String info = response.getString("info");
                String[] splitted = info.split("\"id\":\"");
                String userId = splitted[1].split("\"")[0];
                logger.trace("Attempting to store the new user in the database.");
                databaseHelper.registerUser(username, passwordHash, name, surname, email, admin);
                databaseHelper.registerOnGK(username, passwordHash, userId);
            }
        } catch (Exception e) {
            logger.error("Error while registering a new User: " + e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    private Representation createDashboardAdmin(String username, String password) throws JSONException {
        logger.debug("Attempting to create the initial Dashboard Admin Account in Gatekeeper.");
        GatekeeperTokenGenerator tokenGenerator = new GatekeeperTokenGenerator();
        String tokenId = "";
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username", username);
        jsonObject.put("password", password);
        jsonObject.put("isadmin", "n");
        jsonObject.put("accesslist", "ALL");
        ClientResource clientResource = new ClientResource(Loader.getSettings().getCyclopsSettings().getGk_get_uid());

        try {
            logger.debug("Attempting to get the token to create the account into Gatekeeper.");
            String gatekeeperAdmin = Loader.getSettings().getCyclopsSettings().getGk_admin();
            String gatekeeperPassword = Loader.getSettings().getCyclopsSettings().getGk_password();
            logger.debug("Username: "+gatekeeperAdmin+" Password: "+gatekeeperPassword);
            Representation representation = tokenGenerator.getGatekeeperToken(gatekeeperAdmin, gatekeeperPassword);
            JsonRepresentation jsonRepresentation = null;
            jsonRepresentation = new JsonRepresentation(representation);
            JSONObject repJsonObject = jsonRepresentation.getJsonObject();
            tokenId = repJsonObject.getString("token").substring(7, 43);

            Series<Header> headers = (Series<Header>) clientResource.getRequestAttributes().get("org.restlet.http.headers");
            if (headers == null) {
                headers = new Series<Header>(Header.class);
                clientResource.getRequestAttributes().put("org.restlet.http.headers", headers);
            }
            headers.set("X-Auth-Token", tokenId);

        } catch (IOException e) {
            logger.error("Error while creating the token into GateKeeper: " + e.getMessage());
        }
        Representation representation = null;
        try {
            logger.debug("Checking if the user exists in gatekeeper");
            representation = clientResource.post(jsonObject);
            logger.debug("Admin account created successfully. Default Admin Credentials defined in Configuration file.");
        } catch (Exception e) {
            logger.error("Error while creating the default Admin account. Change the configuration file credentials and redeploy the service.");
        }

        return representation;
    }
}
