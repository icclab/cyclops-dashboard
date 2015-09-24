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

package ch.icclab.cyclops.dashboard.users;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.restlet.data.Form;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.*;

/**
 * This class provides access to the user list
 */
public class User extends ServerResource {
    final static Logger logger = LogManager.getLogger(User.class.getName());

    /**
     * This method gets information about the dashboard users from the Data Base
     *
     * @return A representation of the untouched response
     */
    @Get
    public Representation getUsers() {
        try {
            logger.trace("Attempting to get the Users from the database.");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            Form query = getRequest().getResourceRef().getQueryAsForm();
            if (query.size() == 0)
                return databaseHelper.getUsers();
            else
                return databaseHelper.getAllUsers();
        } catch (Exception e) {
            logger.error("Error while Getting the Users: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    /**
     * This method gets information about the dashboard users from the Data Base
     *
     * @return A representation of the untouched response
     */
    @Put("json")
    public void updateUsers(Representation entity) {
        try {
            logger.trace("Attempting to update the Users in the database.");
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject requestJson = represent.getJsonObject();
            String username = requestJson.getString("user");
            int adminValue = requestJson.getInt("promotion");

            DatabaseHelper databaseHelper = new DatabaseHelper();
            databaseHelper.promoteUser(username, adminValue);
        } catch (Exception e) {
            logger.error("Error while Updating the Users: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}