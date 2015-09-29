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

package ch.icclab.cyclops.dashboard.bills;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.database.DatabaseInteractionException;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.restlet.data.Form;
import org.restlet.data.MediaType;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.FileRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;

import java.io.File;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

public class BillInformation extends ServerResource {
    final static Logger logger = LogManager.getLogger(BillInformation.class.getName());

    @Get
    public Representation getBills() {
        Form query = getRequest().getResourceRef().getQueryAsForm();
        String userId = query.getFirstValue("user_id", "");
        String allBills = query.getFirstValue("a", "");
        JSONArray jsonBills = new JSONArray();
        JsonRepresentation result = new JsonRepresentation(jsonBills);

        DatabaseHelper dbHelper = new DatabaseHelper();
        try {
            logger.debug("Attempting to get the Bills from the database.");
            List<Bill> bills = dbHelper.getBillsForUser(userId, allBills);

            for (Bill bill : bills) {
                JSONObject billJson = new JSONObject();
                billJson.put("from", bill.getFromDate());
                billJson.put("to", bill.getToDate());
                billJson.put("due", bill.getDueDate());
                billJson.put("approved", bill.isApproved());
                billJson.put("paid", bill.isPaid());
                jsonBills.put(billJson);
            }

            return result;

        } catch (DatabaseInteractionException e) {
            logger.error("Error while trying to get bills from the DataBase: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(404);
        } catch (Exception e) {
            logger.error("Error while trying to get bills: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }

    @Post("json")
    public Representation createPDF(Representation entity) {
        Form query = getRequest().getResourceRef().getQueryAsForm();
        String userId = query.getFirstValue("user_id", "");
        String from = query.getFirstValue("from", "");
        String to = query.getFirstValue("to", "");
        String approvedString = query.getFirstValue("a","");
        String paidString = query.getFirstValue("p","");
        boolean approved;
        boolean paid;
        if(approvedString.equals("true"))
            approved = true;
        else
            approved = false;
        if(paidString.equals("true"))
            paid = true;
        else
            paid = false;
        JSONArray jsonBills = new JSONArray();
        JsonRepresentation result = new JsonRepresentation(jsonBills);

        DatabaseHelper dbHelper = new DatabaseHelper();
        try {
            dbHelper.updateBillStatus(userId, from, to, approved, paid);
            return getBills();
        } catch (DatabaseInteractionException e) {
            logger.error("Error while Updating the Bill information: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(404);
        } catch (Exception e) {
            logger.error("Error while Updating the Bill information: "+e.getMessage());
            ErrorReporter.reportException(e);
            throw new ResourceException(500);
        }
    }
}
