
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

package ch.icclab.cyclops.dashboard.prediction;

import ch.icclab.cyclops.dashboard.load.Loader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.data.Form;
import org.restlet.resource.ClientResource;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

import java.io.IOException;

/**
 * Created by manu on 05/02/16.
 */
public class UsagePrediction extends ServerResource {
    final static Logger logger = LogManager.getLogger(UsagePrediction.class.getName());

    @Get
    public String predictData() {
        try {
            logger.debug("Attempting to predict the Usage data");
            Form query = getRequest().getResourceRef().getQueryAsForm();
            String userId = query.getFirstValue("userId");
            String meterName = query.getFirstValue("meterName");
            int use = Integer.parseInt(query.getFirstValue("use"));
            int forecast = Integer.parseInt(query.getFirstValue("forecast"));

            String url = userId + "/" + meterName + "?use=" + use + "&forecast=" + forecast;
            url = Loader.getSettings().getCyclopsSettings().getPrediction_url() + url;
            logger.debug("Sending request to prediction engine: " + url);
            ClientResource clientResource = new ClientResource(url);
//            String s = "{\"from\":\"2016-02-16T11:55:28Z\",\"to\":\"2016-02-27T12:55:28Z\",\"usages\":[{\"time\":\"2016-02-16T13:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T13:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T13:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T14:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T14:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T14:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T15:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T15:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T15:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T16:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T16:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T16:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T17:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T17:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T17:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T18:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T18:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T18:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T19:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T19:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T19:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T20:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T20:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T20:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T21:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T21:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T21:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T22:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T22:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T22:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T23:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T23:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-16T23:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T00:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T00:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T00:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T01:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T01:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T01:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T02:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T02:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T02:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T03:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T03:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T03:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T04:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T04:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T04:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T05:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T05:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T05:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T06:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T06:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T06:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T07:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T07:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T07:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T08:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T08:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T08:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T09:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T09:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T09:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T10:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T10:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T10:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T11:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T11:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T11:00:00Z\",\"usage\":1.0,\"label\":\"cloudstack.ip.address.hours\"},{\"time\":\"2016-02-17T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-18T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-19T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-20T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-21T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-22T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-23T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-24T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-25T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-26T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"},{\"time\":\"2016-02-27T12:55:28Z\",\"usage\":1.0,\"label\":\"predicted.cloudstack.ip.address.hours\"}]}";
            return clientResource.get().getText();
//            return s;
        } catch (Exception e) {
            logger.error("Error trying to send a request to the prediction engine: "+e.getMessage());
        }
        return "";
    }
}
