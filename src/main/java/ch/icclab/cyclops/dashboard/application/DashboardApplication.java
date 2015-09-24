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

package ch.icclab.cyclops.dashboard.application;

import ch.icclab.cyclops.dashboard.bills.BillInformation;
import ch.icclab.cyclops.dashboard.bills.BillPDF;
import ch.icclab.cyclops.dashboard.bills.Billing;
import ch.icclab.cyclops.dashboard.cache.TLBInput;
import ch.icclab.cyclops.dashboard.charge.Charge;
import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.database.DatabaseInteractionException;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.externalMeters.ExternalMeterSources;
import ch.icclab.cyclops.dashboard.externalMeters.ExternalUserAccounts;
import ch.icclab.cyclops.dashboard.keystone.KeystoneAssociation;
import ch.icclab.cyclops.dashboard.keystone.KeystoneMeter;
import ch.icclab.cyclops.dashboard.login.Login;
import ch.icclab.cyclops.dashboard.login.Session;
import ch.icclab.cyclops.dashboard.rate.Rate;
import ch.icclab.cyclops.dashboard.rate.RateStatus;
import ch.icclab.cyclops.dashboard.registration.Registration;
import ch.icclab.cyclops.dashboard.token.TokenInfo;
import ch.icclab.cyclops.dashboard.udr.UdrMeter;
import ch.icclab.cyclops.dashboard.udr.Usage;
import ch.icclab.cyclops.dashboard.users.Admin;
import ch.icclab.cyclops.dashboard.users.User;
import ch.icclab.cyclops.dashboard.users.UserInfo;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Application;
import org.restlet.Context;
import org.restlet.Restlet;
import org.restlet.routing.Router;

import java.io.IOException;
import java.util.HashMap;

public class DashboardApplication extends Application {
    final static Logger logger = LogManager.getLogger(DashboardApplication.class.getName());
    public static HashMap<String, TLBInput> representationHashMap;


    @Override
    public Restlet createInboundRoot() {
        logger.debug("Attemptint to get the instance of the CacheService");
        loadConfiguration(getContext());
        DatabaseHelper dbHelper = new DatabaseHelper();
        logger.debug("Attempting to initianize the Representation HashMap Variable.");
        representationHashMap = new HashMap<String, TLBInput>();
        try {
            logger.trace("Attempting to Create the database.");
            dbHelper.createDatabaseIfNotExists();
            logger.trace("Database created.");
        } catch (DatabaseInteractionException e) {
            logger.error("Error while creating the Database: "+e.getMessage());
            ErrorReporter.reportException(e);
        }

        Router router = new Router(getContext());
        router.attach("/login", Login.class);
        router.attach("/tokeninfo", TokenInfo.class);
        router.attach("/usage", Usage.class);
        router.attach("/rate", Rate.class);
        router.attach("/rate/status", RateStatus.class);
        router.attach("/charge", Charge.class);
        router.attach("/keystonemeters", KeystoneMeter.class);
        router.attach("/udrmeters", UdrMeter.class);
        router.attach("/udrmeters/externalids", ExternalUserAccounts.class);
        router.attach("/udrmeters/externalsources", ExternalMeterSources.class);
        router.attach("/keystone", KeystoneAssociation.class);
        router.attach("/session", Session.class);
        router.attach("/users", User.class);
        router.attach("/users/{user}", UserInfo.class);
        router.attach("/admins", Admin.class);
        router.attach("/billing", Billing.class);
        router.attach("/billing/bills", BillInformation.class);
        router.attach("/billing/bills/pdf", BillPDF.class);
        router.attach("/registration", Registration.class);
        router.attach("/adminRegistration", Registration.class);

        return router;
    }

    /**
     * Loads the configuration file at the beginning of the application startup
     * <p/>
     * Pseudo Code
     * 1. Create the LoadConfiguration class
     * 2. Load the file if the the existing instance of the class is empty
     *
     * @param context
     */
    private void loadConfiguration(Context context) {
        LoadConfiguration loadConfig = new LoadConfiguration();
        if (LoadConfiguration.configuration == null) {
            try {
                loadConfig.run(context);
                logger.trace("Configuration loaded");
            } catch (IOException e) {
                logger.error("Error while loading the configuration: "+e.getMessage());
                e.printStackTrace();
            }
        }
    }
}