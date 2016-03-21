package ch.icclab.cyclops.dashboard.applicationFactory;

import ch.icclab.cyclops.dashboard.application.AbstractApplication;
import ch.icclab.cyclops.dashboard.application.EventDashboardApplication;

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
 * Created by Manu Perez on 02/03/16.
 */

public class EventDashboardApplicationFactory extends AbstractApplicationFactory{
    @Override
    public AbstractApplication loadApplication() {
        return new EventDashboardApplication();
    }
}
