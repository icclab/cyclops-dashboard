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
package ch.icclab.cyclops.dashboard.services.iaas.cloudstack.cloudstackLogin;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Put;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;

/**
 * @author Manu
 *         Created on 14.12.15.
 */
public class CloudstackAssociation extends ServerResource {
    final static Logger logger = LogManager.getLogger(CloudstackAssociation.class.getName());

    @Put("json")
    public void storeKeystoneUserId(Representation entity) {
        try {
            JsonRepresentation representation = new JsonRepresentation(entity);
            JSONObject requestJSON = representation.getJsonObject();
            String username = requestJSON.getString("username");
            String cloudstackId = requestJSON.getString("cloudstackId");
            logger.trace("Attempting to store the Keystone Id in the database.");
            DatabaseHelper databaseHelper = new DatabaseHelper();
            databaseHelper.addCloudstackId(username, cloudstackId);
        } catch (Exception e) {
            logger.error("Error while storing the Keystone Id: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}
