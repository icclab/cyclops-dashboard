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
import ch.icclab.cyclops.dashboard.gatekeeper.GatekeeperTokenGenerator;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.restlet.data.ChallengeScheme;
import org.restlet.data.Form;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.*;

/**
 * This class handles requests the gatekeeper to log into the dashboard
 */
public class Login extends ServerResource {
    final static Logger logger = LogManager.getLogger(Login.class.getName());

    /**
     * This method receives the credentials for a user willing to log in the dashboard.
     *
     * @param entity The incoming request from the dashboard frontend containing username and password
     * @return A representation of the untouched response
     */
    @Post("json")
    @Options
    public Representation login(Representation entity) {
        try {
            logger.trace("Attempting to login");
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject json = represent.getJsonObject();
            String user = json.getString("username");
            String password = json.getString("password");
            return checkUser(user, password, LoadConfiguration.configuration.get("DASHBOARD_USER_TABLE"));
        } catch (Exception e) {
            logger.error("Error while Loging in: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    /**
     * This method tests if the username and password are correct and in the case that the login
     * is a success gets a token for that session
     *
     * @param username
     * @param password
     * @param dbname
     * @return
     * @throws Exception
     */
    private Representation checkUser(String username, String password, String dbname) throws Exception {
        DatabaseHelper databaseHelper = new DatabaseHelper();
        JSONObject jsonObject = new JSONObject();
        GatekeeperTokenGenerator tokenGenerator = new GatekeeperTokenGenerator();
        String hash = DigestUtils.sha1Hex(password);
        logger.trace("Checking if the user exists.");
        if (databaseHelper.existsUser(username, hash, dbname)) {
            Representation representation = tokenGenerator.getGatekeeperToken(username, hash);
            JsonRepresentation jsonRepresentation = new JsonRepresentation(representation);
            JSONObject repJsonObject = jsonRepresentation.getJsonObject();

            String tokenId = repJsonObject.getString("token").substring(7, 43);
            String validUntil = repJsonObject.getString("token").substring(62, 100);

            jsonObject.put("loginInfo", "success");
            jsonObject.put("access_token", tokenId);
            jsonObject.put("valid_until", validUntil);
            jsonObject.put("userId", databaseHelper.getUserId(username));
            jsonObject.put("keystoneId", databaseHelper.getKeystoneId(username));
            jsonObject.put("admin", databaseHelper.isAdmin(username));
        } else {
            jsonObject.put("loginInfo", "fail");
        }
        return new JsonRepresentation(jsonObject);
    }
}
