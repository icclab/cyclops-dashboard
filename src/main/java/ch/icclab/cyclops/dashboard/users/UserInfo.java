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
import ch.icclab.cyclops.dashboard.database.DatabaseInteractionException;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.data.Form;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;

/**
 * This class provides user information
 */
public class UserInfo extends ServerResource {
    final static Logger logger = LogManager.getLogger(UserInfo.class.getName());

    @Get
    public Representation getUserInfo() {
        try {
            logger.trace("Attempting to get the User Info from the database.");
            Form query = getRequest().getResourceRef().getQueryAsForm();
            String username = query.getFirstValue("username", "");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            return databaseHelper.getUserInfo(username);
        } catch (DatabaseInteractionException e) {
            logger.error("Error while Getting user info: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }

    }
}