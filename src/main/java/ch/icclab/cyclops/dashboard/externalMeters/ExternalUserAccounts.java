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

package ch.icclab.cyclops.dashboard.externalMeters;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.restlet.data.Form;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.representation.StringRepresentation;
import org.restlet.resource.*;

import java.util.ArrayList;
import java.util.List;

/**
 * This class handles all the requests necessary to associate a Keystone ID with an OpenAM profile
 */
public class ExternalUserAccounts extends ServerResource {
    final static Logger logger = LogManager.getLogger(ExternalUserAccounts.class.getName());

    @Get
    public Representation getExternalUserIds(Representation entity) {
        try {
            ClientResource clientResource = new ClientResource(LoadConfiguration.configuration.get("UDR_METER_URL"));
            logger.debug("Attempting to get the list of external user IDs.");
            Representation representation = clientResource.get();
            JsonRepresentation jsonRepresentation = new JsonRepresentation(representation);
            JSONObject jsonObject = jsonRepresentation.getJsonObject();
            JSONArray columns = jsonObject.getJSONArray("columns");
            JSONArray points = jsonObject.getJSONArray("points");
            int sourceNameIndex = -1;
            int meterTypeIndex = -1;
            int statusIndex = -1;

            for (int i = 0; i < columns.length(); i++) {
                if (columns.get(i).equals("metersource"))
                    sourceNameIndex = i;
                else {
                    if (columns.get(i).equals("metertype")) {
                        meterTypeIndex = i;
                    } else {
                        if (columns.get(i).equals("status")) {
                            statusIndex = i;
                        }
                    }
                }

            }
            ArrayList<String> activeMeters = new ArrayList<String>();
            ArrayList<String> unactiveMeters = new ArrayList<String>();

            Form query = getRequest().getResourceRef().getQueryAsForm();
            String userId = query.getFirstValue("user_id", "");
            JSONArray response = new JSONArray();

            logger.debug("Sorting active and unactive meters.");
            if (points.length() > 0) {
                for (int i = 0; i < points.length(); i++) {
                    JSONArray innerArray = points.getJSONArray(i);
                    if (innerArray.getString(meterTypeIndex).equals("external"))
                        if (innerArray.getInt(statusIndex) == 1) {
                            activeMeters.add(innerArray.getString(sourceNameIndex));
                        } else
                            unactiveMeters.add(innerArray.getString(sourceNameIndex));
                }
            }

            logger.trace("Attempting to get the user Ids from the database.");
            DatabaseHelper dbHelper = new DatabaseHelper();
            List<ExternalUserId> activeExternalIds = dbHelper.getExternalUserIds(userId, activeMeters, true);
            List<ExternalUserId> unactiveExternalIds = dbHelper.getExternalUserIds(userId, unactiveMeters, false);

            for (ExternalUserId exId : activeExternalIds) {
                JSONObject externalId = new JSONObject();
                externalId.put("source", exId.getSource());
                externalId.put("userId", exId.getUserId());
                response.put(externalId);
            }
            logger.debug("All external Ids added to the response.");

            for (ExternalUserId exId : unactiveExternalIds) {
                JSONObject externalId = new JSONObject();
                externalId.put("source", exId.getSource());
                response.put(externalId);
            }
            logger.debug("All internal Ids added to the response.");

            return new JsonRepresentation(response);
        } catch (Exception e) {
            logger.error("Error obtaining the External User Accounts: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    @Post("json")
    public Representation updateExternalUserIds(Representation entity) {
        try {
            List<ExternalUserId> externalIds = new ArrayList<ExternalUserId>();
            JsonRepresentation represent = new JsonRepresentation(entity);
            JSONObject requestJson = represent.getJsonObject();
            String userId = requestJson.getString("userId");
            JSONArray externalIdsJson = requestJson.getJSONArray("externalIds");

            for (int i = 0; i < externalIdsJson.length(); i++) {
                JSONObject externalIdJson = externalIdsJson.getJSONObject(i);
                externalIds.add(new ExternalUserId(externalIdJson.getString("source"), externalIdJson.getString("userId")));
            }
            logger.trace("Attempting to update the User External Id in the database.");
            DatabaseHelper dbHelper = new DatabaseHelper();
            dbHelper.updateExternalUserIds(userId, externalIds);

            return new StringRepresentation("");
        } catch (Exception e) {
            logger.error("Error while updating External Ids: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}
