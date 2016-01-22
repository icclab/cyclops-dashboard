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
public class OpenstackSettings {
    private String KEYSTONE_CYCLOPS_USERNAME;
    private String KEYSTONE_CYCLOPS_PASSWORD;
    private String KEYSTONE_CYCLOPS_DOMAIN;
    private String KEYSTONE_TENANT_NAME;
    private String KEYSTONE_TOKEN_URL;
    private String KEYSTONE_METERS_URL;
    private String CeilometerURL;
    private String KeystoneURL;

    public OpenstackSettings(String KEYSTONE_CYCLOPS_USERNAME, String KEYSTONE_CYCLOPS_PASSWORD, String KEYSTONE_CYCLOPS_DOMAIN, String KEYSTONE_TENANT_NAME, String KEYSTONE_TOKEN_URL, String KEYSTONE_METERS_URL, String ceilometerURL, String keystoneURL) {
        this.KEYSTONE_CYCLOPS_USERNAME = KEYSTONE_CYCLOPS_USERNAME;
        this.KEYSTONE_CYCLOPS_PASSWORD = KEYSTONE_CYCLOPS_PASSWORD;
        this.KEYSTONE_CYCLOPS_DOMAIN = KEYSTONE_CYCLOPS_DOMAIN;
        this.KEYSTONE_TENANT_NAME = KEYSTONE_TENANT_NAME;
        this.KEYSTONE_TOKEN_URL = KEYSTONE_TOKEN_URL;
        this.KEYSTONE_METERS_URL = KEYSTONE_METERS_URL;
        CeilometerURL = ceilometerURL;
        KeystoneURL = keystoneURL;
    }

    public String getKEYSTONE_CYCLOPS_USERNAME() {
        return KEYSTONE_CYCLOPS_USERNAME;
    }

    public String getKEYSTONE_CYCLOPS_PASSWORD() {
        return KEYSTONE_CYCLOPS_PASSWORD;
    }

    public String getKEYSTONE_CYCLOPS_DOMAIN() {
        return KEYSTONE_CYCLOPS_DOMAIN;
    }

    public String getKEYSTONE_TENANT_NAME() {
        return KEYSTONE_TENANT_NAME;
    }

    public String getKEYSTONE_TOKEN_URL() {
        return KEYSTONE_TOKEN_URL;
    }

    public String getKEYSTONE_METERS_URL() {
        return KEYSTONE_METERS_URL;
    }

    public String getCeilometerURL() {
        return CeilometerURL;
    }

    public String getKeystoneURL() {
        return KeystoneURL;
    }
}
