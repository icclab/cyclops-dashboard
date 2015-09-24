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
package ch.icclab.cyclops.dashboard.cache;

import java.util.*;

/**
 * This class is contains the CacheData in a SortedMap
 *
 * @author Manu
 */
public class TLBInput {

    private SortedMap<String, CacheData> meterHashMap = new TreeMap<String, CacheData>();
    private HashMap<String, String> headerHashMap = new HashMap<String, String>();
    private String header;

    private String KeystoneId;
    private Date from;
    private Date to;
    private int frequency;
    private String accessTime;
    private CacheData cacheData;

    public TLBInput(String data, Date from, Date to) {
        this.to = to;
        this.from = from;
        this.frequency = 0;
        addData(data, from, to);
    }

    /**
     * This method attempts to add data into the Cache from @from to @to if its not present. In case of
     * having data for the meter in which we are trying to have add data, it will only add the data regarding
     * to the timestamps that aren't already inserted.
     *
     * @param data
     * @param from
     * @param to
     */
    public void addData(String data, Date from, Date to) {
        ArrayList<String> responseArrayList = new ArrayList<String>();
        String[] responses = data.split("},\\{");
        String headerSignature = "";
        if(!data.split("\"usage\":")[1].equals("{}}")){
            if (from.getTime() < this.from.getTime())
                this.from = from;
            if (to.getTime() > this.to.getTime())
                this.to = to;
            for (int i = 0; i < responses.length; i++) {
                if (!responseArrayList.contains(responses[i]))//checking if the response contains repeated fields
                    if (i > 0) {
                        if (i == responses.length - 1)
                            responses[i] = responses[i].substring(0, responses[i].length() - 5);
                        if (!responses[i - 1].contains(responses[i]))
                            responseArrayList.add(responses[i]);
                    } else {
                        headerSignature = responses[i].split("\\{\"name\":")[0];
                        responseArrayList.add("{\"name\":" + responses[i].split("\\{\"name\":")[1]);
                    }
            }
            for (String response : responseArrayList) {
                String meterName = response.split("name\":")[1];
                meterName = meterName.split("\"")[1];
                if (meterHashMap.containsKey(meterName)) {
                    this.cacheData = meterHashMap.get(meterName);
                    this.cacheData.putData(response);
                } else {
                    this.cacheData = new CacheData(response, meterName);
                    header = headerSignature;
                    meterHashMap.put(meterName, cacheData);

                }
            }
        }else{
            header = responses[0].split("}}")[0]+"\"OpenStack\":[  ";
        }
    }

    /**
     * This method attempts to get the data from @from to @to and format them in thefollowing format:
     * {"userid":"USERIDX","time":{"to":"YYYY-MM-DD HH:mm","from":"YYYY-MM-DD HH:mm"},"usage":{"TYPE":[METERDATA1,..,METERDATAX]}}
     *
     * @param from
     * @param to
     * @return
     */
    public String getData(Date from, Date to) {
        String response = header;
        if (meterHashMap.keySet().size() > 1)
            response = response + "{";
        for (String key : meterHashMap.keySet()) {
            if (response.charAt(response.length() - 1) == '{' && meterHashMap.get(key).getDataFromTo(from, to).charAt(0) == '{')
                response = response.substring(0, response.length() - 1);
            response = response + meterHashMap.get(key).getDataFromTo(from, to).concat(",{");
        }
        response = response.substring(0, response.length() - 2).concat("]}}");
        return response;
    }


    public String getKeystoneId() {
        return KeystoneId;
    }

    public Date getFrom() {
        return from;
    }

    public Date getTo() {
        return to;
    }

    public int getFrequency() {
        return frequency;
    }

    public String getAccessTime() {
        return accessTime;
    }

    public void setKeystoneId(String keystoneId) {
        KeystoneId = keystoneId;
    }

    public void setFrom(Date from) {
        this.from = from;
    }

    public void setTo(Date to) {
        this.to = to;
    }
}
