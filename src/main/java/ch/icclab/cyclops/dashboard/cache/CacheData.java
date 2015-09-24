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


import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @author Manu
 *         Created by root on 17.08.15.
 */
public class CacheData {

    final static Logger logger = LogManager.getLogger(CacheData.class.getName());
    private int timeIndex;

    private String[] data;
    private String userId;
    private String from;
    private String to;
    private String type;
    private String name;
    private long dataFrom;


    private String headerSignature;
    private String endingSignature = "]}";//]}
    private String columnSignature;


    private SortedMap<Long, String> usageDataMap;
    String meterName;

    /**
     * @param stringData
     * @author Manu
     * <p/>
     * This method adds the data points to the usageDataMap linked to their timestamp
     */
    public CacheData(String stringData, String meter) {
        logger.debug("Attempting to format the data for inserting in the cache...");
        meterName = meter.toUpperCase();
        headerSignature = stringData.split("\"points\":")[0].concat("\"points\":");// use "points" in influxDB 0.8.x and "values" in influxDB 0.9.x
        logger.debug("[" + meterName + "] Obtained header from the json response: " + headerSignature);

        String columns = stringData.split("columns\":")[1];
        columns = columns.split("]")[0];
        this.columnSignature = columns.concat("]");
        columns = columns.substring(1, columns.length());
        logger.debug("[" + meterName + "] Obtained Columns from the data: " + columnSignature);
        usageDataMap = new TreeMap<Long, String>();

        //get the time from the string splitting and store all the points.
        String[] columnsArray = columns.split(",");
        this.timeIndex = -1;
        for (int i = 0; i < columnsArray.length && timeIndex == -1; i++) {
            if (columnsArray[i].equalsIgnoreCase("\"time\"")) {
                timeIndex = i;
            }
        }
        logger.debug("[" + meterName + "] Obtained Time index: " + timeIndex);
        this.putData(stringData);
    }

    /**
     * This method puts the data referring to a timestamp into the usageDataMap
     *
     * @param response
     */
    public void putData(String response) {
        String data = response.split("points\":")[1];//use "points" with influxdb 0.8.x and "values" with influxDB 0.9.x
        data = data.substring(1, data.length() - 1);

        String[] points = data.split("],\\[");
        for (int i = 0; i < points.length; i++) {
            String time = points[i].split(",")[timeIndex];
            if (timeIndex == 0 && i == 0)
                time = time.substring(1, time.length());
            if (timeIndex == points.length - 1)
                time = time.substring(0, time.length() - 1);
            logger.debug("[" + meterName + "] Obtained time from data: " + time);
            if (!usageDataMap.keySet().contains(formatDate(time).getTime())) { //Long.valueOf(time) in influxdb 0.8.x and formatDate(time).getTime() in influxdb 0.9
                if (i == 0) {
                    if (points[i].substring(points[i].length() - 4, points[i].length()).equals("]}]}"))
                        points[i] = points[i].substring(1, points[i].length() - 5);
                    else
                        points[i] = points[i].substring(1, points[i].length());
                    usageDataMap.put(formatDate(time).getTime(), points[i]);//Long.valueOf(time) in influxdb 0.8.x and formatDate(time).getTime() in influxdb 0.9
                } else if (i == points.length - 1) {
                    if (points[i].substring(points[i].length() - 1, points[i].length()).equals("]")) {
                        points[i] = points[i].substring(0, points[i].length() - 1);
                    }
                    if (points[i].substring(points[i].length() - 4, points[i].length()).equals("]}]}")) {
                        points[i] = points[i].substring(0, points[i].length() - 5);
                    }
                    usageDataMap.put(formatDate(time).getTime(), points[i]);//Long.valueOf(time) in influxdb 0.8.x and formatDate(time).getTime() in influxdb 0.9
                } else {
                    usageDataMap.put(formatDate(time).getTime(), points[i]);//Long.valueOf(time) in influxdb 0.8.x and formatDate(time).getTime() in influxdb 0.9
                }
                logger.info("[" + meterName + "] Added point: " + points[i]);//Logging this as "debug" will increase notably the size of the cache file
            }
        }
    }

    /*public String getData() {
        String result = headerSignature + "[[";
        for (Long time : usageDataMap.keySet()) {
            result = result.concat(usageDataMap.get(time) + "],[");
        }
        result = result.substring(0, result.length() - 2);
        result = result.concat(endingSignature);
        return result;
    }

    public ArrayList<String> getDataList() {
        ArrayList<String> usageArray = new ArrayList<String>();
        for (Long key : usageDataMap.keySet()) {
            usageArray.add(usageDataMap.get(key));
        }
        return usageArray;
    }*/

    /**
     * This method returns the whole data points between @to and @from correctly formatted in the following way:
     * {name:"NAME",columns:[C1,C2..,CX],points:[[point0],[point1],[...],[pointX]]}
     *
     * @param from
     * @param to
     * @return
     */
    public String getDataFromTo(Date from, Date to) {
        String result = headerSignature + "[[";
        String point;
        for (Long time : usageDataMap.keySet()) {
            if (time >= from.getTime() && time <= to.getTime()) {
                point = formatPoint(usageDataMap.get(time));
                result = result.concat(point + "],[");
            }
        }
        result = result.substring(0, result.length() - 2);
        if(result.charAt(result.length()-1)==':')
            result = result.concat("[");
        result = result.concat(endingSignature);
        logger.info("Generated response from getData() :" + result);//Logging this as "debug" will increase notably the size of the cache file
        return result;
    }

    public SortedMap<Long, String> getUsageDataMap() {
        return usageDataMap;
    }

    private Date formatDate(String dateAndTime) {
        Date result = null;
        try {
            String date = dateAndTime.split("T")[0];
            String hour = dateAndTime.split("T")[1];
            date = date.substring(1, date.length());
            hour = hour.substring(0, 8);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            date = date + " " + hour;
            result = formatter.parse(date);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    private String formatPoint(String point){
        String date = point.substring(0,21);
        Long timestamp = formatDate(date).getTime();
        String result = String.valueOf(timestamp).concat(point.substring(22));
        if(result.charAt(result.length()-1)==']')
            result = result.substring(0, result.length()-1);
        return result;
    }

}
