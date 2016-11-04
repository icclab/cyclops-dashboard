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
package ch.cyclops.load;

import ch.cyclops.load.model.CyclopsSettings;
import ch.cyclops.load.model.OpenStackCredentials;
import ch.cyclops.load.model.RepresentationSettings;

import java.util.Properties;

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
public class Settings {


    // Object for reading and accessing configuration properties
    private Properties properties;

    // List of different settings that are being loaded from configuration file
    protected OpenStackCredentials openStackCredentials;
    protected CyclopsSettings cyclopsSettings;
    protected RepresentationSettings representationSettings;

    /**
     * Load settings based on provided settings
     */
    public Settings(Properties prop) {
        properties = prop;
    }

    //=============== OpenStack Settings

    /**
     * Load OpenStack credentials
     *
     * @return credentials
     */
    private OpenStackCredentials loadOpenStackCredentials() {
        OpenStackCredentials openStackCredentials = new OpenStackCredentials();

        openStackCredentials.setKeystoneAccount(properties.getProperty("keystoneAccount"));
        openStackCredentials.setKeystonePassword(properties.getProperty("keystonePassword"));
        openStackCredentials.setKeystoneTenant(properties.getProperty("keystoneTenant"));
        openStackCredentials.setKeystoneUrl(properties.getProperty("keystoneUrl"));
        openStackCredentials.setKeystoneAdminUrl(properties.getProperty("keystoneAdminUrl"));

        return openStackCredentials;
    }

    /**
     * Access loaded OpenStack credentials
     *
     * @return OpenStack credentials
     */
    public OpenStackCredentials getOpenStackCredentials() {

        if (openStackCredentials == null) {
            openStackCredentials = loadOpenStackCredentials();
        }

        return openStackCredentials;
    }

    //=============== Billing Settings

    /**
     * Load Billing settings
     *
     * @return billing settings
     */
    private CyclopsSettings loadBillingSettings() {
        CyclopsSettings cyclopsSettings = new CyclopsSettings();

        cyclopsSettings.setBillingUrl(properties.getProperty("billingUrl"));
        cyclopsSettings.setUdrDataUrl(properties.getProperty("udrDataUrl"));
        cyclopsSettings.setCdrDataUrl(properties.getProperty("cdrDataUrl"));

        return cyclopsSettings;
    }

    /**
     * Access loaded Billing settings
     *
     * @return
     */
    public CyclopsSettings getCyclopsSettings() {
        if (cyclopsSettings == null) {
            cyclopsSettings = loadBillingSettings();
        }
        return cyclopsSettings;
    }

    public RepresentationSettings getRepresentationSettings(){
        if(representationSettings == null){
            representationSettings = loadRepresentationSettings();
        }
        return representationSettings;
    }

    private RepresentationSettings loadRepresentationSettings() {
        RepresentationSettings representationSettings = new RepresentationSettings();

        representationSettings.setTimeSlices(Integer.parseInt(properties.getProperty("timeSlices")));

        return representationSettings;
    }
}
