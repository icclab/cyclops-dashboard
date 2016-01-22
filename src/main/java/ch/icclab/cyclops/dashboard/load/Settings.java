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
package ch.icclab.cyclops.dashboard.load;

import ch.icclab.cyclops.dashboard.load.model.CyclopsSettings;
import ch.icclab.cyclops.dashboard.load.model.OpenstackSettings;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Properties;

/**
 * @author Manu
 *         Created on 18.11.15.
 */
public class Settings {
    final static Logger logger = LogManager.getLogger(Settings.class.getName());

    // different settings options
    protected CyclopsSettings cyclopsSettings;
    protected OpenstackSettings openstackSettings;

    private String environment;
    Properties properties;

    public Settings(Properties properties) {
        // parse environment settings
        environment = properties.getProperty("Environment");
        this.properties = properties;
    }

    public String getEnvironment() {

        return environment;
    }

    public String getBillImagePath(){
        return properties.getProperty("WEB-INF");
    }


    private CyclopsSettings loadCyclopsSettings() {
        CyclopsSettings settings = new CyclopsSettings();
        settings.setDashboard_admin(properties.getProperty("DASHBOARD_ADMIN"));
        settings.setDashboard_password(properties.getProperty("DASHBOARD_PASSWORD"));
        settings.setDashboard_db_path(properties.getProperty("DASHBOARD_DB_PATH"));
        settings.setDashboard_user_table(properties.getProperty("DASHBOARD_USER_TABLE"));
        settings.setUdr_usage_url(properties.getProperty("UDR_USAGE_URL"));
        settings.setUdr_meter_url(properties.getProperty("UDR_METER_URL"));
        settings.setRc_rate_url(properties.getProperty("RC_RATE_URL"));
        settings.setRc_rate_status_url(properties.getProperty("RC_RATE_STATUS_URL"));
        settings.setRc_charge_url(properties.getProperty("RC_CHARGE_URL"));
        settings.setBilling_invoice_url(properties.getProperty("BILLING_INVOICE_URL"));
        settings.setBilling_pdf_path(properties.getProperty("BILLING_PDF_PATH"));
        settings.setError_reporter_enabled(properties.getProperty("ERROR_REPORTER_ENABLED"));
        settings.setError_reporter_host(properties.getProperty("ERROR_REPORTER_HOST"));
        settings.setError_reporter_port(properties.getProperty("ERROR_REPORTER_PORT"));
        settings.setError_reporter_virtual_host(properties.getProperty("ERROR_REPORTER_VIRTUAL_HOST"));
        settings.setError_reporter_username(properties.getProperty("ERROR_REPORTER_USERNAME"));
        settings.setError_reporter_password(properties.getProperty("ERROR_REPORTER_PASSWORD"));
        settings.setGk_get_uid(properties.getProperty("GK_GET_UID"));
        settings.setGk_token_url(properties.getProperty("GK_TOKEN_URL"));
        settings.setGk_auth_url(properties.getProperty("GK_AUTH_URL"));
        settings.setGk_auth_token_info_url(properties.getProperty("GK_AUTH_TOKEN_INFO_URL"));
        settings.setGk_list_users_url(properties.getProperty("GK_LIST_USERS_URL"));
        settings.setGk_admin(properties.getProperty("GK_ADMIN"));
        settings.setGk_password(properties.getProperty("GK_PASSWORD"));
        settings.setMax_cached_users(properties.getProperty("MAX_CACHED_USERS"));
        settings.setData_period(properties.getProperty("DATA_PERIOD"));
        settings.setCache(properties.getProperty("CACHE"));
        return settings;
    }

    private OpenstackSettings loadOpenstackSettings() {
        return new OpenstackSettings(properties.getProperty("KEYSTONE_CYCLOPS_USERNAME"),properties.getProperty("KEYSTONE_CYCLOPS_PASSWORD"),
                properties.getProperty("KEYSTONE_CYCLOPS_DOMAIN"),properties.getProperty("KEYSTONE_TENANT_NAME"),
                properties.getProperty("KEYSTONE_TOKEN_URL"),properties.getProperty("KEYSTONE_METERS_URL"),
                properties.getProperty("CeilometerURL"), properties.getProperty("KeystoneURL"));
    }

    public CyclopsSettings getCyclopsSettings() {
        if (cyclopsSettings == null) {
            try {
                cyclopsSettings = loadCyclopsSettings();
            } catch (Exception e) {
                logger.error("Could not load Cyclops settings from configuration file: " + e.getMessage());
            }
        }
        return cyclopsSettings;
    }

    public OpenstackSettings getOpenstackSettings(){
        if (openstackSettings == null) {
            try {
                openstackSettings = loadOpenstackSettings();
            } catch (Exception e) {
                logger.error("Could not load Cyclops settings from configuration file: " + e.getMessage());
            }
        }
        return openstackSettings;
    }

}
