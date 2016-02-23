
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

package ch.icclab.cyclops.dashboard.applicationFactory;

import ch.icclab.cyclops.dashboard.application.AbstractApplication;
import ch.icclab.cyclops.dashboard.load.Loader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Context;

/**
 * @author Manu
 *         Created by root on 16.11.15.
 */
public abstract class AbstractApplicationFactory {
    final static Logger logger = LogManager.getLogger(AbstractApplicationFactory.class.getName());

    public static AbstractApplication getApplication(Context context) {
        try {
            // get environment settings
            Loader loader = Loader.createInstance(context);

            logger.debug("Attempting to get the Environment from the Configuration file.");
            String applicationClassName = Loader.getEnvironment();
            String packagePath = "ch.icclab.cyclops.dashboard.applicationFactory.";
            logger.debug("Attempting to create the application Class");
            AbstractApplicationFactory creator = (AbstractApplicationFactory) Class.forName(packagePath
                    .concat(applicationClassName).concat("DashboardApplicationFactory")).newInstance();
            return creator.loadApplication();
        } catch (Exception e) {
            logger.error("Error while getting the Application Class loaded: " + e.getMessage());
        }
        return null;
    }

    public abstract AbstractApplication loadApplication();
}
