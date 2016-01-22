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

import ch.icclab.cyclops.dashboard.applicationFactory.AbstractApplicationFactory;
import ch.icclab.cyclops.dashboard.cache.TLBInput;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Application;
import org.restlet.Restlet;

import java.util.HashMap;

public class DashboardApplication extends Application{
    final static Logger logger = LogManager.getLogger(DashboardApplication.class.getName());
    public static HashMap<String, TLBInput> representationHashMap;


    @Override
    public Restlet createInboundRoot() {
        return AbstractApplicationFactory.getApplication(getContext());
    }

}