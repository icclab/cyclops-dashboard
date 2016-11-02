package ch.cyclops;

import ch.cyclops.load.Loader;
import ch.cyclops.model.Cyclops.Bill;
import ch.cyclops.model.Cyclops.CDR;
import ch.cyclops.model.Cyclops.LocalBillRequest;
import ch.cyclops.model.Cyclops.UDR;
import ch.cyclops.model.Data.CdrMeasurement;
import ch.cyclops.model.Data.GenericChargeData;
import ch.cyclops.model.Data.GenericUsageData;
import ch.cyclops.model.Data.UdrMeasurement;
import ch.cyclops.model.OpenStack.*;
import ch.cyclops.publish.APICaller;
import com.google.gson.Gson;
import org.openstack4j.api.OSClient;
import org.openstack4j.api.exceptions.AuthenticationException;
import org.openstack4j.api.types.Facing;
import org.openstack4j.model.identity.Tenant;
import org.openstack4j.model.identity.TenantUser;
import org.openstack4j.model.identity.User;
import org.openstack4j.openstack.OSFactory;
import org.restlet.Client;
import org.restlet.Request;
import org.restlet.data.Header;
import org.restlet.data.MediaType;
import org.restlet.data.Protocol;
import org.restlet.engine.header.HeaderConstants;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.util.Series;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URL;
import java.util.*;

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

@Controller
public class BillingController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String helloWorld(@RequestParam(value = "username", required = true, defaultValue = "") String username, Model model) {
        if (username.length() == 0) return "login";
        model.addAttribute("username", username);
        model.addAttribute("company", "ICCLab - RCB");
        return "switch_overview";
    }

    /**
     * Requests and returns to the front end the information of the disabled OpenStack users for the credentials passed through API.
     *
     * @param username
     * @param password
     * @param model
     * @return
     */
    @RequestMapping(value = "/", method = RequestMethod.POST)
    public String indexSubmit(@RequestParam("username") String username, @RequestParam("password") String password, Model model) {
        if (username != null || password != null) {
            OSClient os = buildOSClient(username, password);
            if (os == null) {
                return "page_403";
            }
            List<? extends org.openstack4j.model.identity.User> users = os.identity().users().list();
            LinkedList<OSData> billingUsers = new LinkedList<>();

            for (int i = 0; i < users.size(); i++) {
                org.openstack4j.model.identity.User temp = users.get(i);
//                if (!temp.isEnabled()) { // Not necessary on generic usecase
                OSData test = new OSData();
                test.id = temp.getId();
                test.name = temp.getUsername();
                billingUsers.add(test);
//                }
            }
            model.addAttribute("username", username);
            model.addAttribute("password", password);
            model.addAttribute("users", billingUsers);

            return "switch_overview";
        } else {
            return "page_403";
        }
    }

    /**
     * Requests and returns the Tenants where the selected user
     *
     * @param username
     * @param model
     * @return
     */
    @RequestMapping(value = "/tenants", method = RequestMethod.POST)
    public String indexSubmitGet(@RequestParam("username") String username, @RequestParam("password") String password, @RequestParam("selectedUser") String selectedUser, Model model) {
        LinkedList<OpenStackUser> tenantList = getTenantList(selectedUser, password);

        model.addAttribute("tenants", tenantList);
        model.addAttribute("tenantName", selectedUser);
        model.addAttribute("username", username);
        model.addAttribute("password", password);

        return "switch_tenants";
    }

    /**
     * This method gets the Tenant list for a Specified Username
     *
     * @param username
     * @return
     */
    private LinkedList<OpenStackUser> getTenantList(String username, String password) {
        OSClient authorizedOSClient = buildAuthorizedOSClient();
        OSClient userOSClient = buildOSClient(username, password);
        ArrayList<OpenStackTenant> tenants = getOpenStackTenants(userOSClient);
        LinkedList<OpenStackUser> tenantList = new LinkedList<>();

        for (int i = 0; i < tenants.size(); i++) {
            OpenStackTenant tenant = tenants.get(i);
            ArrayList<OpenStackTenantUser> tenantUsers = getOpenStackTenantUserList(authorizedOSClient, tenant);
            for (int j = 0; j < tenantUsers.size(); j++) {
                    OpenStackTenantUser temp = tenantUsers.get(j);
                if (temp.getName().equalsIgnoreCase(username)) {
                    OpenStackUser test = new OpenStackUser();
                    test.setUserId(tenant.getId());
                    test.setTenantName(tenant.getName());
                    test.setUserName(username);
                    tenantList.add(test);
                }
            }
        }
        return tenantList;
    }

    /**
     * This method gets the users present in a specified tenant.
     * @param os
     * @param tenant
     * @return
     */
    private ArrayList<OpenStackTenantUser> getOpenStackTenantUserList(OSClient os, OpenStackTenant tenant) {
        try{
            Gson gson = new Gson();
            String url = Loader.getSettings().getOpenStackCredentials().getKeystoneAdminUrl() + "/tenants/"+tenant.getId()+"/users";

            ClientResource cr = new ClientResource(url);
            Request req = cr.getRequest();

            // now header
            Series<Header> headerValue = new Series<Header>(Header.class);
            req.getAttributes().put(HeaderConstants.ATTRIBUTE_HEADERS, headerValue);
            headerValue.add("X-Auth-Token", os.getToken().getId());

            // fire it up
            cr.get(MediaType.APPLICATION_JSON);
            Representation output = cr.getResponseEntity();

            OpenStackTenantUserListResponse response = gson.fromJson(output.getText(), OpenStackTenantUserListResponse.class);

            return response.getUsers();
        }catch(Exception e) {
            //Log
            System.out.println("Error while getting the list of users using a tenant: "+e.getMessage());
            return null;
        }
    }

    /**
     * This method gets the tenants from openstack using the config file parameter.
     *
     * @param os
     * @return
     */
    private ArrayList<OpenStackTenant> getOpenStackTenants(OSClient os) {
        try {
            Gson gson = new Gson();
            String url = Loader.getSettings().getOpenStackCredentials().getKeystoneUrl() + "/tenants";

            ClientResource cr = new ClientResource(url);
            Request req = cr.getRequest();

            // now header
            Series<Header> headerValue = new Series<Header>(Header.class);
            req.getAttributes().put(HeaderConstants.ATTRIBUTE_HEADERS, headerValue);
            headerValue.add("X-Auth-Token", os.getToken().getId());

            // fire it up
            cr.get(MediaType.APPLICATION_JSON);
            Representation output = cr.getResponseEntity();

            OpenStackTenantListResponse response = gson.fromJson(output.getText(), OpenStackTenantListResponse.class);
            return response.getTenants();
        } catch (Exception e) {
            //Log
            System.out.println("Error while getting the tenant list: " + e.getMessage());
            return null;
        }
    }

    /**
     * Requests and returns the Tenants where the selected user
     *
     * @param username
     * @param model
     * @return
     */
    @RequestMapping(value = "/users", method = RequestMethod.POST)
    public String indexSubmitPost(@RequestParam("username") String username, @RequestParam("password") String password, @RequestParam("selectedUser") String selectedUser, Model model) {
        LinkedList<OpenStackUser> userList = getUserList(selectedUser);

        model.addAttribute("users", userList);
        model.addAttribute("selectedUser", selectedUser);
        model.addAttribute("username", username);
        model.addAttribute("password", password);

        return "switch_tenants";
    }

    /**
     * This method gets the Tenant list for a Specified Username
     *
     * @param username
     * @return
     */
    private LinkedList<OpenStackUser> getUserList(String username) {
        OSClient os = buildAuthorizedOSClient();
        List<? extends org.openstack4j.model.identity.User> users = os.identity().users().list();
        LinkedList<OpenStackUser> userList = new LinkedList<>();

        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            OpenStackUser openStackUser = new OpenStackUser();
            openStackUser.setUserId(user.getId());
            openStackUser.setTenantName(user.getName());
            openStackUser.setUserName(username);
            userList.add(openStackUser);
        }
        return userList;
    }

    /**
     * This method requests billing information for a user and a specified time range to Cyclops' back end and responds with the
     *
     * @param tenants
     * @param username
     * @param from
     * @param to
     * @param model
     * @return
     */
    @RequestMapping(value = "/bill", method = RequestMethod.POST)
    public String generateBill(@RequestParam("tenants") String[] tenants, @RequestParam("tenantName") String tenantName, @RequestParam("username") String username, @RequestParam("password") String password, @RequestParam("from") String from, @RequestParam("to") String to, Model model) {
        //tenantName = selectedUser to bill.
        String billingUrl = Loader.getSettings().getCyclopsSettings().getBillingUrl();
        Long timeFrom = formatDate(from);
        Long timeTo = formatDate(to);
        ArrayList<String> linked = new ArrayList<>();
        //TODO: add linked accounts
//        linked.add("X");
        List<Bill> list = new ArrayList();
        for (int i = 0; i < tenants.length; i++) {
            LocalBillRequest billRequest = new LocalBillRequest(tenants[i], linked, timeFrom, timeTo);
            try {
                APICaller.Response response = new APICaller().post(new URL(billingUrl), billRequest);
                try {
                    list = response.getAsListOfType(Bill.class);
                } catch (Exception e) {
                    //ignored, it's not a list
                    Bill bill = (Bill) response.getAsClass(Bill.class);
                    list.add(bill);
                }
                for (int o = 0; o < list.size(); o++) {
                    Bill bill = list.get(o);

                    bill.setUtcFrom(bill.getFrom());
                    bill.setUtcTo(bill.getTo());
                }
                model.addAttribute("bills", list);

            } catch (Exception e) {
                System.out.println("Error while requesting the bill: " + e.getMessage());
            }
        }
        model.addAttribute("tenants", Arrays.asList(tenants));
        model.addAttribute("tenantName", tenantName);
        model.addAttribute("username", username);
        model.addAttribute("password", password);

        return "switch_invoice";
    }

    @RequestMapping("/login")
    public String login(Model model) {
        return "login";
    }

    @RequestMapping("/overview")
    public String overview() {

        return "overview";
    }

    /**
     * Returns to the front end the usage measurements that can be represented as graphs.
     *
     * @param username
     * @param model
     * @return
     */
    public String getUsagePage(String username, String password, Model model) {
//        String udrMeasurementsUrl = Loader.getSettings().getCyclopsSettings().getUdrMeasurementsUrl();
        String udrMeasurementsUrl = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        List<String> measurements = new ArrayList<>();
        LinkedList<OpenStackUser> userList = getUserList(username);
        List<String> userIdList = new ArrayList<>();
        List<String> tenantNameList = new ArrayList<>();
        for (OpenStackUser user : userList) {
            userIdList.add(user.getUserId());
            tenantNameList.add(user.getTenantName());
        }
        try {
            APICaller.Response response = new APICaller().get(new URL(udrMeasurementsUrl));
            measurements = response.getAsList();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        model.addAttribute("username", username);
        model.addAttribute("password", password);
        model.addAttribute("legendValues", measurements.toArray());
        model.addAttribute("userIdList", userIdList);
        model.addAttribute("tenantNameList", tenantNameList);

        return "switch_udr_chartjs";
    }

    /**
     * This method obtains the graph selection and the time frame for it from the front end,
     * requests the usage information to Cyclops' back end and returns it to the front end to represent it.
     *
     * @param username
     * @param model
     * @return
     */
    @RequestMapping(value = "/usage", method = RequestMethod.POST)
    public String generateUsageGraph(@RequestParam(value = "graphSelection", required = false) String[] graphSelection, @RequestParam(value = "tenant", required = false) String tenant, @RequestParam("username") String username, @RequestParam("password") String password, @RequestParam(value = "from", required = false) String from, @RequestParam(value = "to", required = false) String to, Model model) {
        //Check if we are Redirecting from the menu
//        if (graphSelection == null || tenant == null) {
//            return getUsagePage(username, password, model);
//        }
        //Otherwise perform as expected
        Long timeFrom = initialiseFrom(from);
        Long timeTo = initialiseTo(to);
        int slices = Loader.getSettings().getRepresentationSettings().getTimeSlices();
        long sliceDuration = (long) ((double) ((timeTo - timeFrom) / slices));
        Double[] slicesData = new Double[Loader.getSettings().getRepresentationSettings().getTimeSlices()];
        List<Long> timestamps = getTimestamps(timeFrom, slices, sliceDuration);
        HashMap<String, HashMap<String, Object>> pairs = new HashMap<>();
        HashMap<String, HashMap<String, Object>> slicePairs = new HashMap<>();
        HashMap<String, HashMap<String, Double[]>> sliceMap = new HashMap<>();
        List<String> measurements = new ArrayList<>();
        LinkedList<OpenStackUser> tenantList = getTenantList(username, password);
        List<String> tenantNameList = new ArrayList<>();
        HashMap<String, String> measurementCharts = new HashMap<>();
        HashMap<String, String> measurementUnits = new HashMap<>();
        ArrayList<String> graphSelectionValues = new ArrayList<>();
        HashMap<String, Double> totalUsage = new HashMap<>();
        String tenantId = "";
        String nameField = Loader.getSettings().getRepresentationSettings().getNameField();
        for (OpenStackUser user : tenantList) {
            try {
                UdrMeasurement udrMeasurement = getUdrMeasurement(user.getUserId(), timeFrom, timeTo);
                //Iterate trhough all the pages
                if (udrMeasurement.getPageNumber() != null)
                    for (int page = udrMeasurement.getPageNumber(); page < ((float) udrMeasurement.getTotalRecords() / (float) udrMeasurement.getPageSize()); page++) {
                        if (page > 0) {
                            udrMeasurement = getUdrMeasurementForPage(page);
                        }
                        //Iterate through every UDR
                        for (UDR udr : udrMeasurement.getData()) {
                            //Iterate through every Usage Data inside the UDR and add the usage to it's place in the slices
                            for (GenericUsageData data : udr.getData()) {
                                String resource = data.getMetadata().get(nameField).toString();
                                addUsageToSlicesDataHistogram(sliceMap, data, resource, udr.getTime(), timestamps, timeFrom, sliceDuration, data.get_class());
                                fillUsageData(data, measurementUnits, timestamps, pairs, sliceMap.get(udr.get_class()), slicePairs, measurementCharts, graphSelectionValues, totalUsage, nameField, tenantId);
                            }
                        }
                    }
            } catch (Exception e) {
                System.out.print("Error while getting data from the tenant: " + e.getMessage());
            }
        }
//        if (pairs.isEmpty())
//            return getUsagePage(username, password, model);
        addUsageModel(model, measurementCharts, measurementUnits, pairs, sliceMap, slicePairs, timestamps, timeFrom, username, password, measurements, graphSelectionValues, tenantNameList, totalUsage);


        return "switch_udr_chartjs";
    }

    private List<Long> getTimestamps(Long timeFrom, int slices, long sliceDuration) {
        ArrayList timestamps = new ArrayList();
        for (int i = 0; i < slices; i++) {
            timestamps.add(timeFrom + i * sliceDuration);
        }
        return timestamps;
    }

    /**
     * Returns to the front end the charge measurements that can be represented as graphs.
     *
     * @param username
     * @param model
     * @return
     */
    public String getChargePage(String username, String password, Model model) {
//        String cdrMeasurementsUrl = Loader.getSettings().getCyclopsSettings().getCdrMeasurementsUrl();
        String cdrMeasurementsUrl = Loader.getSettings().getCyclopsSettings().getCdrDataUrl();
        List<String> measurements = new ArrayList<>();
        LinkedList<OpenStackUser> tenantList = getTenantList(username, password);
        List<String> tenantNameList = new ArrayList<>();
        for (OpenStackUser user : tenantList)
            tenantNameList.add(user.getTenantName());
        try {
            APICaller.Response response = new APICaller().get(new URL(cdrMeasurementsUrl));
            measurements = response.getAsList();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        model.addAttribute("username", username);
        model.addAttribute("password", password);
        model.addAttribute("legendValues", measurements.toArray());
        model.addAttribute("tenantList", tenantNameList);

        return "switch_cdr_chartjs";
    }

    /**
     * This method obtains the graph selection and the time frame for it from the front end,
     * requests the charge information to Cyclops' back end and returns it to the front end to represent it.
     * *
     *
     * @param username
     * @param model
     * @return
     */
    @RequestMapping(value = "/charge", method = RequestMethod.POST)
    public String generateCharge(@RequestParam(value = "graphSelection", required = false) String[] graphSelection, @RequestParam(value = "tenant", required = false) String tenant, @RequestParam("username") String username, @RequestParam("password") String password, @RequestParam(value = "from", required = false) String from, @RequestParam(value = "to", required = false) String to, Model model) {
        //Check if we are Redirecting from the menu
//        if (graphSelection == null || tenant == null) {
//            return getUsagePage(username, password, model);
//        }
        //Otherwise perform as expected
        Long timeFrom = initialiseFrom(from);
        Long timeTo = initialiseTo(to);
        int slices = Loader.getSettings().getRepresentationSettings().getTimeSlices();
        long sliceDuration = (long) ((double) ((timeTo - timeFrom) / slices));
        Double[] slicesData = new Double[Loader.getSettings().getRepresentationSettings().getTimeSlices()];
        List<Long> timestamps = getTimestamps(timeFrom, slices, sliceDuration);
        HashMap<String, HashMap<String, Object>> pairs = new HashMap<>();
        HashMap<String, HashMap<String, Object>> slicePairs = new HashMap<>();
        HashMap<String, HashMap<String, Double[]>> sliceMap = new HashMap<>();
        List<String> measurements = new ArrayList<>();
        LinkedList<OpenStackUser> tenantList = getTenantList(username, password);
        List<String> tenantNameList = new ArrayList<>();
        HashMap<String, String> measurementCharts = new HashMap<>();
        HashMap<String, Double> measurementCharges = new HashMap<>();
        ArrayList<String> graphSelectionValues = new ArrayList<>();
        String tenantId = "";
        HashMap<String, Double> totalCharge = new HashMap<>();
        String nameField = Loader.getSettings().getRepresentationSettings().getNameField();
        for (OpenStackUser user : tenantList) {
            try {
                CdrMeasurement cdrMeasurement = getCdrMeasurement(user.getUserId(), timeFrom, timeTo);
                //Iterate trough all the pages
                for (int page = cdrMeasurement.getPageNumber(); page < ((float) cdrMeasurement.getTotalRecords() / (float) cdrMeasurement.getPageSize()); page++) {
                    if (page > 0) {
                        cdrMeasurement = getCdrMeasurementForPage(page);
                    }
                    //Iterate through every CDR
                    for (CDR cdr : cdrMeasurement.getData()) {
                        //Iterate through every Charge Data inside the CDR
                        for (GenericChargeData data : cdr.getData()) {
                            String resource = data.getMetadata().get(nameField).toString();
                            addChargeToSlicesDataHistogram(sliceMap, data, resource, cdr.getTime(), timestamps, timeFrom, sliceDuration, data.get_class());
                            fillChargeData(data, timestamps, pairs, sliceMap.get(cdr.get_class()), slicePairs, measurementCharts, graphSelectionValues, totalCharge, nameField, tenantId);
                        }
                    }
                }
            } catch (Exception e) {
                System.out.print("Error: " + e.getMessage());
            }
        }
//        if (pairs.isEmpty())
//            return getChargePage(username, password, model);
        addChargeModel(model, measurementCharts, measurementCharges, pairs, sliceMap, slicePairs, timestamps, username, password, measurements, graphSelectionValues, tenantNameList, totalCharge);

        return "switch_cdr_chartjs_modals";
    }

    private void fillChargeData(GenericChargeData data, List<Long> timestamps, HashMap<String, HashMap<String, Object>> pairs, HashMap<String, Double[]> slicesData, HashMap<String, HashMap<String, Object>> slicePairs, HashMap<String, String> measurementCharts, ArrayList<String> graphSelectionValues, HashMap<String, Double> totalCharge, String nameField, String tenantId) {
        String pieRepresentation = "number";
        List<Double> values;
        HashMap<String, Object> metaHash = pairs.get(data.get_class());
        HashMap<String, Object> sliceMetaHash = slicePairs.get(data.get_class());
        if (metaHash == null)
            metaHash = new HashMap<>();
        if (sliceMetaHash == null)
            sliceMetaHash = new HashMap<>();
        Map metadata = data.getMetadata();
        //Using pie representation for all of them in the overview page
        //If the data is identified by metadata we can know who is the consumer
        if (metadata != null)
            values = (List<Double>) metaHash.get(metadata.get(nameField).toString());
        else
            values = (List<Double>) metaHash.get(tenantId);
        if (values == null) {
            values = new ArrayList<>();
        }
        Double charge = data.getCharge();
        values.add(charge);
//        timestamps.add(time);

        if (metadata != null) {
            metaHash.put(metadata.get(nameField).toString(), values);
            sliceMetaHash.put(metadata.get(nameField).toString(), slicesData);
        } else {
            metaHash.put(tenantId, values);
            sliceMetaHash.put(tenantId, slicesData);
        }
        pairs.put(data.get_class(), metaHash);
        slicePairs.put(data.get_class(), sliceMetaHash);
        measurementCharts.put(data.get_class(), pieRepresentation);

        if (!graphSelectionValues.contains(data.get_class())) graphSelectionValues.add(data.get_class());
        if (totalCharge.containsKey(data.get_class())) {
            totalCharge.put(data.get_class(), data.getCharge() + totalCharge.get(data.get_class()));
        } else {
            totalCharge.put(data.get_class(), data.getCharge());
        }
    }

    private void addChargeToSlicesDataHistogram(HashMap<String, HashMap<String, Double[]>> sliceMap, GenericChargeData data, String resource, Long time, List<Long> timestamps, Long timeFrom, long sliceDuration, String measurement) {
        Double charge = data.getCharge();
        timestamps.add(time);

        HashMap<String, Double[]> resourceMap = null;

        if (sliceMap.containsKey(measurement))
            resourceMap = sliceMap.get(measurement);
        else
            sliceMap.put(measurement, new HashMap<>());
        Double[] slicesData;
        if (resourceMap != null)
            slicesData = resourceMap.get(resource);
        else
            slicesData = null;

        if (slicesData == null)
            slicesData = new Double[Loader.getSettings().getRepresentationSettings().getTimeSlices()];
        int slice;
        double d = (time - timeFrom);
        d = d / sliceDuration;
        slice = (int) Math.ceil(d) - 1;
        if (slicesData[slice] == null)
            slicesData[slice] = charge;
        else
            slicesData[slice] = slicesData[slice] + charge;
        HashMap<String, Double[]> measurementData;
        if (sliceMap.containsKey(measurement)) {
            measurementData = sliceMap.get(measurement);
            measurementData.put(resource, slicesData);
        } else {
            measurementData = new HashMap();
            measurementData.put(resource, slicesData);
            sliceMap.put(measurement, measurementData);
        }
    }

    private Double[] mergeArrays(Double[] array1, Double[] array2) {
        Double[] result = new Double[Loader.getSettings().getRepresentationSettings().getTimeSlices()];
        if (array1 != null && array2 != null)
            for (int i = 0; i < result.length; i++) {
                if (array1[i] != null && array2[i] != null)
                    result[i] = array1[i] + array2[i];
                else if (array1[i] != null && array2[i] == null)
                    result[i] = array1[i];
                else if (array1[i] == null && array2[i] != null)
                    result[i] = array2[i];

            }
        else if (array1 == null) {
            if (array2 == null)
                return null;
            else
                return array2;
        } else return array1;
        return result;
    }

    private void fillUsageData(GenericUsageData data, HashMap<String, String> measurementUnits, List<Long> timestamps, HashMap<String, HashMap<String, Object>> pairs, HashMap<String, Double[]> slicesData, HashMap<String, HashMap<String, Object>> slicePairs, HashMap<String, String> measurementCharts, ArrayList<String> graphSelectionValues, HashMap<String, Double> totalUsage, String nameField, String tenantId) {
        String pieRepresentation = "number";
        String histogramRepresentation = "histogram";
        List<Double> values;
        HashMap<String, Object> metaHash = pairs.get(data.get_class());
        HashMap<String, Object> sliceMetaHash = slicePairs.get(data.get_class());
        if (metaHash == null)
            metaHash = new HashMap<>();
        if (sliceMetaHash == null)
            sliceMetaHash = new HashMap<>();
        Map metadata = data.getMetadata();
        //Using pie representation for all of them in the overview page
        //If the data is identified by metadata we can know who is the consumer
        if (metadata != null)
            values = (List<Double>) metaHash.get(metadata.get(nameField).toString());
        else
            values = (List<Double>) metaHash.get(tenantId);
        if (values == null) {
            values = new ArrayList<>();
        }
        Double usage = data.getUsage();
        values.add(usage);

        if (metadata != null) {
            metaHash.put(metadata.get(nameField).toString(), values);
            sliceMetaHash.put(metadata.get(nameField).toString(), slicesData);
        } else {
            metaHash.put(tenantId, values);
            sliceMetaHash.put(tenantId, slicesData);
        }
        pairs.put(data.get_class(), metaHash);
        slicePairs.put(data.get_class(), sliceMetaHash);
        measurementCharts.put(data.get_class(), pieRepresentation);
        measurementUnits.put(data.get_class(), data.getUnit());

        if (!graphSelectionValues.contains(data.get_class())) graphSelectionValues.add(data.get_class());
        if (totalUsage.containsKey(data.get_class())) {
            totalUsage.put(data.get_class(), data.getUsage() + totalUsage.get(data.get_class()));
        } else {
            totalUsage.put(data.get_class(), data.getUsage());
        }
    }


    /**
     * This method builds the OpenStack Client with the provided credentials
     *
     * @param username
     * @param password
     * @return
     */
    private OSClient buildOSClient(String username, String password) {
        OSClient os;
        String keystoneUrl = Loader.getSettings().getOpenStackCredentials().getKeystoneUrl();
        String keystoneTenant = Loader.getSettings().getOpenStackCredentials().getKeystoneTenant();

        OSFactory.enableLegacyEndpointHandling(true);
        try {
            os = OSFactory.builder()
                    .endpoint(keystoneUrl)
                    .credentials(username, password)
//                    .tenantName(keystoneTenant)
//                    .perspective(Facing.ADMIN)
                    .authenticate();
        } catch (Exception e) {
            os = null;
            System.out.println(e.getMessage());
        }
        return os;
    }

    /**
     * This method builds an Authorized OpenStack client based on the credentials given in the configuration file.
     *
     * @return
     */
    private OSClient buildAuthorizedOSClient() {
        OSClient os;
        String keystoneUrl = Loader.getSettings().getOpenStackCredentials().getKeystoneUrl();
        String keystoneTenant = Loader.getSettings().getOpenStackCredentials().getKeystoneTenant();
        String keystoneAccount = Loader.getSettings().getOpenStackCredentials().getKeystoneAccount();
        String keystonePassword = Loader.getSettings().getOpenStackCredentials().getKeystonePassword();

        OSFactory.enableLegacyEndpointHandling(true);
        try {
            os = OSFactory.builder()
                    .endpoint(keystoneUrl)
                    .credentials(keystoneAccount, keystonePassword)
                    .tenantName(keystoneTenant)
                    .perspective(Facing.ADMIN)
                    .authenticate();
        } catch (AuthenticationException e) {
            os = null;
            System.out.println("Couldn't Authenticate: " + e.getMessage());
        }
        return os;
    }

    /**
     * This method transforms a String date into a Timestamp
     *
     * @param dateString
     * @return
     */
    private Long formatDate(String dateString) {
        if (!dateString.equals("") && !dateString.equals(null)) {
            Date date = new Date(dateString);
            return date.getTime() / 1000;
        }
        return -1l;
    }

    /**
     * This method constructs a measurement URL
     *
     * @param url
     * @param measurement
     * @param timeFrom
     * @param timeTo
     * @return
     */
    private String constructMeasurementUrl(String url, String measurement, String tenant, long timeFrom, long timeTo) {
        String resultUrl;
        if (timeFrom > 0) {
            if (timeTo > 0) {
                resultUrl = url + measurement + "?from=" + timeFrom + "&to=" + timeTo + "&account=" + tenant;
            } else {
                resultUrl = url + measurement + "?from=" + timeFrom + "&account=" + tenant;
            }
        } else if (timeTo > 0) {
            resultUrl = url + measurement + "?to=" + timeTo + "&account=" + tenant;
        } else {
            resultUrl = url + measurement + "?account=" + tenant;
        }
        return resultUrl;
    }

    /**
     * This method constructs a measurement URL for a specified page number
     *
     * @param url
     * @param page
     * @return
     */
    private String constructMeasurementUrlForPage(String url, int page) {
        if (url.contains("?"))
            return url + "&page=" + page;
        else
            return url + "?page=" + page;
    }

    private UdrMeasurement getUdrMeasurementForPage(int page) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        APICaller.Response response = new APICaller().get(new URL(constructMeasurementUrlForPage(url, page)));
        return (UdrMeasurement) response.getAsClass(UdrMeasurement.class);
    }

    private CdrMeasurement getCdrMeasurementForPage(int page) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getCdrDataUrl();
        APICaller.Response response = new APICaller().get(new URL(constructMeasurementUrlForPage(url, page)));
        return (CdrMeasurement) response.getAsClass(CdrMeasurement.class);
    }

    /**
     * this method gets the measurement data for a specified meter and tenant in a specified timeframe
     *
     * @param graphSelection
     * @param tenant
     * @param timeFrom
     * @param timeTo
     * @return
     * @throws Exception
     */
    private UdrMeasurement getSingleMeasurement(String graphSelection, String tenant, Long timeFrom, Long timeTo) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        String udrMeasurementUrl = this.constructMeasurementUrl(url, graphSelection, tenant, timeFrom, timeTo);
        APICaller.Response response = new APICaller().get(new URL(udrMeasurementUrl));
        return (UdrMeasurement) response.getAsClass(UdrMeasurement.class);
    }

    private UdrMeasurement getUdrMeasurement(String tenant, Long timeFrom, Long timeTo) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        String udrMeasurementUrl = this.constructDataUrl(url, tenant, timeFrom, timeTo);
        APICaller.Response response = new APICaller().get(new URL(udrMeasurementUrl));
        return (UdrMeasurement) response.getAsClass(UdrMeasurement.class);
    }

    private CdrMeasurement getCdrMeasurement(String tenant, Long timeFrom, Long timeTo) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getCdrDataUrl();
        String cdrMeasurementUrl = this.constructDataUrl(url, tenant, timeFrom, timeTo);
        APICaller.Response response = new APICaller().get(new URL(cdrMeasurementUrl));
        return (CdrMeasurement) response.getAsClass(CdrMeasurement.class);
    }

    private String constructDataUrl(String url, String tenant, Long timeFrom, Long timeTo) {
        String resultUrl;
        if (timeFrom > 0) {
            if (timeTo > 0) {
                resultUrl = url + "?from=" + timeFrom + "&to=" + timeTo + "&account=" + tenant;
            } else {
                resultUrl = url + "?from=" + timeFrom + "&account=" + tenant;
            }
        } else if (timeTo > 0) {
            resultUrl = url + "?to=" + timeTo + "&account=" + tenant;
        } else {
            resultUrl = url + "?account=" + tenant;
        }
        return resultUrl;
    }

    /**
     * This method is used to get the List of Measurements
     *
     * @return
     * @throws Exception
     */
    private List<String> getMeasurementList() throws Exception {
        APICaller.Response response;
        String udrMeasurementsUrl = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        response = new APICaller().get(new URL(udrMeasurementsUrl));
        return response.getAsList();
    }

    /**
     * This method adds the value to the timeSlices array in their correct time slice.
     *
     * @param sliceMap
     * @param data
     * @param resource
     * @param time
     * @param timestamps
     * @param timeFrom
     * @param sliceDuration
     * @param measurement
     */
    private void addUsageToSlicesDataHistogram(HashMap<String, HashMap<String, Double[]>> sliceMap, GenericUsageData data, String resource, Long time, List<Long> timestamps, Long timeFrom, Long sliceDuration, String measurement) {
        Double usage = data.getUsage();
        timestamps.add(time);

        HashMap<String, Double[]> resourceMap = null;

        if (sliceMap.containsKey(measurement))
            resourceMap = sliceMap.get(measurement);
        else
            sliceMap.put(measurement, new HashMap<>());
        Double[] slicesData;
        if (resourceMap != null)
            slicesData = resourceMap.get(resource);
        else
            slicesData = null;

        if (slicesData == null)
            slicesData = new Double[Loader.getSettings().getRepresentationSettings().getTimeSlices()];
        int slice;
        double d = (time - timeFrom);
        d = d / sliceDuration;
        slice = (int) Math.ceil(d) - 1;
        if (slicesData[slice] == null)
            slicesData[slice] = usage;
        else
            slicesData[slice] = slicesData[slice] + usage;

        HashMap<String, Double[]> measurementData;
        if (sliceMap.containsKey(measurement)) {
            measurementData = sliceMap.get(measurement);
            measurementData.put(resource, slicesData);
        } else {
            measurementData = new HashMap();
            measurementData.put(resource, slicesData);
            sliceMap.put(measurement, measurementData);
        }
    }

    /**
     * This method adds the usage to the values list.
     *
     * @param values
     * @param data
     * @param timestamps
     */
    private void addUsageToValuesPie(List<Double> values, GenericUsageData data, List<Long> timestamps) {
        if (values == null) {
            values = new ArrayList<>();
        }
        Double usage = data.getUsage();
        Long time = data.getTime();
        values.add(usage);
        timestamps.add(time);
    }

    private long initialiseFrom(String from) {
        if (from == null) {
            Date now = new Date(System.currentTimeMillis());
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(now);
            calendar.add(Calendar.DATE, -1);
            Date dateFrom = calendar.getTime();
            return dateFrom.getTime() / 1000;
        } else {
            return formatDate(from);
        }
    }

    private long initialiseTo(String to) {
        if (to == null) {
            Date now = new Date(System.currentTimeMillis());
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(now);
            calendar.add(Calendar.DATE, -1);
            return now.getTime() / 1000;
        } else {
            return formatDate(to);
        }
    }


    private void addUsageModel(Model model, HashMap<String, String> measurementCharts, HashMap<String, String> measurementUnits, HashMap<String, HashMap<String, Object>> pairs, HashMap<String, HashMap<String, Double[]>> sliceMap, HashMap<String, HashMap<String, Object>> slicePairs, List<Long> timestamps, Long timeFrom, String username, String password, List<String> measurements, ArrayList<String> graphSelectionValues, List<String> tenantNameList, HashMap<String, Double> totalUsage) {
        model.addAttribute("timeSlices", Loader.getSettings().getRepresentationSettings().getTimeSlices());
        model.addAttribute("measurementCharts", measurementCharts);
        model.addAttribute("measurementUnits", measurementUnits);
        model.addAttribute("pairs", pairs);
        model.addAttribute("slicePairs", slicePairs);
        model.addAttribute("sliceMap", sliceMap);
        model.addAttribute("timestamps", timestamps);
        model.addAttribute("username", username);
        model.addAttribute("password", password);
        model.addAttribute("legendValues", measurements.toArray());
        model.addAttribute("graphSelection", graphSelectionValues);
        model.addAttribute("tenantNameList", tenantNameList);
        model.addAttribute("totalUsage", totalUsage);
    }

    private void addChargeModel(Model model, HashMap<String, String> measurementCharts, HashMap<String, Double> measurementCharges, HashMap<String, HashMap<String, Object>> pairs, HashMap<String, HashMap<String, Double[]>> sliceMap, HashMap<String, HashMap<String, Object>> slicePairs, List<Long> timestamps, String username, String password, List<String> measurements, ArrayList<String> graphSelectionValues, List<String> tenantNameList, HashMap<String, Double> totalCharge) {
        model.addAttribute("timeSlices", Loader.getSettings().getRepresentationSettings().getTimeSlices());
        model.addAttribute("measurementCharts", measurementCharts);
        model.addAttribute("measurementCharges", measurementCharges);
        model.addAttribute("pairs", pairs);
        model.addAttribute("slicePairs", slicePairs);
        model.addAttribute("sliceMap", sliceMap);
        model.addAttribute("timestamps", timestamps);
        model.addAttribute("username", username);
        model.addAttribute("password", password);
        model.addAttribute("legendValues", measurements.toArray());
        model.addAttribute("graphSelection", graphSelectionValues);
        model.addAttribute("tenantNameList", tenantNameList);
        model.addAttribute("totalCharge", totalCharge);
    }
}
