package ch.cyclops.load.model;

/**
 * Copyright (c) 2015. Zuercher Hochschule fuer Angewandte Wissenschaften
 * All Rights Reserved.
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 * <p>
 * Created by Manu Perez on 28/07/16.
 */

public class OpenStackCredentials {
    private String keystoneUrl;
    private String keystoneAdminUrl;
    private String keystoneAccount;
    private String keystonePassword;
    private String keystoneTenant;
    private String keystoneAdminRole;

    public String getKeystoneAdminRole() {
        return keystoneAdminRole;
    }

    public void setKeystoneAdminRole(String keystoneAdminRole) {
        this.keystoneAdminRole = keystoneAdminRole;
    }

    public String getKeystoneAdminUrl() {
        return keystoneAdminUrl;
    }

    public void setKeystoneAdminUrl(String keystoneAdminUrl) {
        this.keystoneAdminUrl = keystoneAdminUrl;
    }

    public String getKeystoneUrl() {
        return keystoneUrl;
    }

    public void setKeystoneUrl(String keystoneUrl) {
        this.keystoneUrl = keystoneUrl;
    }

    public String getKeystoneAccount() {
        return keystoneAccount;
    }

    public void setKeystoneAccount(String keystoneAccount) {
        this.keystoneAccount = keystoneAccount;
    }

    public String getKeystonePassword() {
        return keystonePassword;
    }

    public void setKeystonePassword(String keystonePassword) {
        this.keystonePassword = keystonePassword;
    }

    public String getKeystoneTenant() {
        return keystoneTenant;
    }

    public void setKeystoneTenant(String keystoneTenant) {
        this.keystoneTenant = keystoneTenant;
    }
}
