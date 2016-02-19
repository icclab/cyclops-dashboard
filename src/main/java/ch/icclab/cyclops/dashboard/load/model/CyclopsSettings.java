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
package ch.icclab.cyclops.dashboard.load.model;

/**
 * @author Manu
 *         Created on 18.11.15.
 */
public class CyclopsSettings {
    private String dashboard_admin;
    private String dashboard_password;
    private String dashboard_db_path;
    private String dashboard_user_table;
    private String udr_usage_url;
    private String udr_meter_url;
    private String rc_rate_url;
    private String rc_rate_status_url;
    private String rc_charge_url;
    private String billing_invoice_url;
    private String billing_pdf_path;
    private String error_reporter_enabled;
    private String error_reporter_host;
    private String error_reporter_port;
    private String error_reporter_virtual_host;
    private String error_reporter_username;
    private String error_reporter_password;
    private String gk_get_uid;
    private String gk_token_url;
    private String gk_auth_url;
    private String gk_auth_token_info_url;
    private String gk_list_users_url;
    private String gk_admin;
    private String gk_password;
    private String max_cached_users;
    private String data_period;
    private String cache;

    public String getPrediction_url() {
        return prediction_url;
    }

    public void setPrediction_url(String prediction_url) {
        this.prediction_url = prediction_url;
    }

    private String prediction_url;

    public void setDashboard_admin(String dashboard_admin) {
        this.dashboard_admin = dashboard_admin;
    }

    public void setDashboard_password(String dashboard_password) {
        this.dashboard_password = dashboard_password;
    }

    public void setDashboard_db_path(String dashboard_db_path) {
        this.dashboard_db_path = dashboard_db_path;
    }

    public void setDashboard_user_table(String dashboard_user_table) {
        this.dashboard_user_table = dashboard_user_table;
    }

    public void setUdr_usage_url(String udr_usage_url) {
        this.udr_usage_url = udr_usage_url;
    }

    public void setUdr_meter_url(String udr_meter_url) {
        this.udr_meter_url = udr_meter_url;
    }

    public void setRc_rate_url(String rc_rate_url) {
        this.rc_rate_url = rc_rate_url;
    }

    public void setRc_rate_status_url(String rc_rate_status_url) {
        this.rc_rate_status_url = rc_rate_status_url;
    }

    public void setRc_charge_url(String rc_charge_url) {
        this.rc_charge_url = rc_charge_url;
    }

    public void setBilling_invoice_url(String billing_invoice_url) {
        this.billing_invoice_url = billing_invoice_url;
    }

    public void setBilling_pdf_path(String billing_pdf_path) {
        this.billing_pdf_path = billing_pdf_path;
    }

    public void setError_reporter_enabled(String error_reporter_enabled) {
        this.error_reporter_enabled = error_reporter_enabled;
    }

    public void setError_reporter_host(String error_reporter_host) {
        this.error_reporter_host = error_reporter_host;
    }

    public void setError_reporter_port(String error_reporter_port) {
        this.error_reporter_port = error_reporter_port;
    }

    public void setError_reporter_virtual_host(String error_reporter_virtual_host) {
        this.error_reporter_virtual_host = error_reporter_virtual_host;
    }

    public void setError_reporter_username(String error_reporter_username) {
        this.error_reporter_username = error_reporter_username;
    }

    public void setError_reporter_password(String error_reporter_password) {
        this.error_reporter_password = error_reporter_password;
    }

    public void setGk_get_uid(String gk_get_uid) {
        this.gk_get_uid = gk_get_uid;
    }

    public void setGk_token_url(String gk_token_url) {
        this.gk_token_url = gk_token_url;
    }

    public void setGk_auth_url(String gk_auth_url) {
        this.gk_auth_url = gk_auth_url;
    }

    public void setGk_auth_token_info_url(String gk_auth_token_info_url) {
        this.gk_auth_token_info_url = gk_auth_token_info_url;
    }

    public void setGk_list_users_url(String gk_list_users_url) {
        this.gk_list_users_url = gk_list_users_url;
    }

    public void setGk_admin(String gk_admin) {
        this.gk_admin = gk_admin;
    }

    public void setGk_password(String gk_password) {
        this.gk_password = gk_password;
    }

    public void setMax_cached_users(String max_cached_users) {
        this.max_cached_users = max_cached_users;
    }

    public void setData_period(String data_period) {
        this.data_period = data_period;
    }

    public void setCache(String cache) {
        this.cache = cache;
    }

    public String getDashboard_admin() {
        return dashboard_admin;
    }

    public String getDashboard_password() {
        return dashboard_password;
    }

    public String getDashboard_db_path() {
        return dashboard_db_path;
    }

    public String getDashboard_user_table() {
        return dashboard_user_table;
    }

    public String getUdr_usage_url() {
        return udr_usage_url;
    }

    public String getUdr_meter_url() {
        return udr_meter_url;
    }

    public String getRc_rate_url() {
        return rc_rate_url;
    }

    public String getRc_rate_status_url() {
        return rc_rate_status_url;
    }

    public String getRc_charge_url() {
        return rc_charge_url;
    }

    public String getBilling_invoice_url() {
        return billing_invoice_url;
    }

    public String getBilling_pdf_path() {
        return billing_pdf_path;
    }

    public String getError_reporter_enabled() {
        return error_reporter_enabled;
    }

    public String getError_reporter_host() {
        return error_reporter_host;
    }

    public String getError_reporter_port() {
        return error_reporter_port;
    }

    public String getError_reporter_virtual_host() {
        return error_reporter_virtual_host;
    }

    public String getError_reporter_username() {
        return error_reporter_username;
    }

    public String getError_reporter_password() {
        return error_reporter_password;
    }

    public String getGk_get_uid() {
        return gk_get_uid;
    }

    public String getGk_token_url() {
        return gk_token_url;
    }

    public String getGk_auth_url() {
        return gk_auth_url;
    }

    public String getGk_auth_token_info_url() {
        return gk_auth_token_info_url;
    }

    public String getGk_list_users_url() {
        return gk_list_users_url;
    }

    public String getGk_admin() {
        return gk_admin;
    }

    public String getGk_password() {
        return gk_password;
    }

    public String getMax_cached_users() {
        return max_cached_users;
    }

    public String getData_period() {
        return data_period;
    }

    public String getCache() {
        return cache;
    }
}