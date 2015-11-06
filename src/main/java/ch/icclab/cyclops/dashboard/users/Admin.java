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
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.representation.Representation;
import org.restlet.resource.*;


public class Admin extends ServerResource {
    final static Logger logger = LogManager.getLogger(Admin.class.getName());

    /**
     * This method gets information about the dashboard admins from the DataBase
     *
     * @return  A representation of the untouched response
     */
    @Get
    public Representation getAdminGroupInfo() throws DatabaseInteractionException {
        logger.trace("Attempting to get the Admins from the database.");
        DatabaseHelper databaseHelper = new DatabaseHelper();
        return databaseHelper.getAdmins();
    }
}