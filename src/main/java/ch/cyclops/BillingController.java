package ch.cyclops;

import ch.cyclops.load.Loader;
import ch.cyclops.model.Cyclops.*;
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
import org.openstack4j.model.identity.User;
import org.openstack4j.openstack.OSFactory;
import org.restlet.Request;
import org.restlet.data.Header;
import org.restlet.data.MediaType;
import org.restlet.engine.header.HeaderConstants;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;
import org.restlet.util.Series;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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
@SessionAttributes({"username", "password"})
public class BillingController {

    /**
     * This method sets the session attributes to null in order to invalidate all the actions/kill the session.
     *
     * @param model
     * @return
     */
    @RequestMapping(value = "/logout", method = RequestMethod.POST)
    public String logout(Model model) {
        if (model.containsAttribute("username") && model.containsAttribute("password")) {
            model.addAttribute("username", new String());
            model.addAttribute("password", new String());
        }
        return "login";
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String login(Model model) {
        HashMap attributes = (HashMap) model.asMap();
        if (!attributes.containsKey("username"))
            return "login";
        else if (attributes.get("username").equals("") || attributes.get("password").equals("")) return "login";
        return generateCharge((String) attributes.get("username"), (String) attributes.get("password"), null, null, model);
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
                return "403";
            }
            String adminRole = Loader.getSettings().getOpenStackCredentials().getKeystoneAdminRole();
            List<? extends org.openstack4j.model.identity.Role> roles = os.identity().roles().list();

            List<? extends org.openstack4j.model.identity.User> users = os.identity().users().list();
            LinkedList<OSData> billingUsers = new LinkedList<>();

            for (int i = 0; i < users.size(); i++) {
                org.openstack4j.model.identity.User temp = users.get(i);
                OSData test = new OSData();
                test.id = temp.getId();
                test.name = temp.getUsername();
                billingUsers.add(test);
            }
            model.addAttribute("username", username);
            model.addAttribute("password", password);
            model.addAttribute("users", billingUsers);
            // Relink to the index page, in this case the Usage page.
            if (roles.contains(adminRole))
                return generateCharge(username, password, null, null, model);
            else
                return generateCharge(username, password, null, null, model);
        } else {
            return "403";
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
    public String indexSubmitGet(@ModelAttribute("username") String username, @ModelAttribute("password") String password, @RequestParam("selectedUser") String selectedUser, Model model) {
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
                    OpenStackUser userWithTenantId = new OpenStackUser();
                    userWithTenantId.setUserId(tenant.getId());
                    userWithTenantId.setTenantName(tenant.getName());
                    userWithTenantId.setUserName(username);
                    tenantList.add(userWithTenantId);

                    OpenStackUser userWithUserId = new OpenStackUser();
                    userWithUserId.setUserId(temp.getId());
                    userWithUserId.setTenantName(tenant.getName());
                    userWithUserId.setUserName(temp.getName());
                    tenantList.add(userWithUserId);
                }
            }
        }
        return tenantList;
    }

    /**
     * This method gets the users present in a specified tenant.
     *
     * @param os
     * @param tenant
     * @return
     */
    private ArrayList<OpenStackTenantUser> getOpenStackTenantUserList(OSClient os, OpenStackTenant tenant) {
        try {
            Gson gson = new Gson();
            String url = Loader.getSettings().getOpenStackCredentials().getKeystoneAdminUrl() + "/tenants/" + tenant.getId() + "/users";

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
        } catch (Exception e) {
            //Log
            System.out.println("Error while getting the list of users using a tenant: " + e.getMessage());
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
    public String indexSubmitPost(@ModelAttribute("username") String username, @ModelAttribute("password") String password, @RequestParam("selectedUser") String selectedUser, Model model) {
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
    public String generateBill(@RequestParam("tenants") String[] tenants, @RequestParam("tenantName") String tenantName, @ModelAttribute("username") String username, @ModelAttribute("password") String password, @RequestParam("from") String from, @RequestParam("to") String to, Model model) {
        String billingUrl = Loader.getSettings().getCyclopsSettings().getBillingUrl();
        Long timeFrom = formatDate(from);
        Long timeTo = formatDate(to);
        ArrayList<String> linked = new ArrayList<>();
        //TODO: add linked accounts
//        linked.add("X");
        List<Bill> list = new ArrayList();
        for (int i = 0; i < tenants.length; i++) {
            if (!Loader.getSettings().getCyclopsSettings().getBillType().equals("")) {
                //TODO: manage bill requests
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
                    System.out.println("Error while requesting the local bill: " + e.getMessage());
                }
            } else {
                BillRequest billRequest = new BillRequest(tenants[i], linked, timeFrom, timeTo);
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
        }
        model.addAttribute("tenants", Arrays.asList(tenants));
        model.addAttribute("tenantName", tenantName);
        model.addAttribute("username", username);
        model.addAttribute("password", password);

        return "switch_invoice";
    }

    @RequestMapping("/overview")
    public String overview() {

        return "overview";
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
    public String generateUsageGraph(@ModelAttribute("username") String username, @ModelAttribute("password") String password, @RequestParam(value = "from", required = false) String from, @RequestParam(value = "to", required = false) String to, Model model) {
        boolean isAdmin = isOpenStackAdmin(username, password);
        //TODO: redirigir a user o a admin
        Long timeFrom = initialiseFrom(from);
        Long timeTo = initialiseTo(to);
        int slices = Loader.getSettings().getRepresentationSettings().getTimeSlices();
        long sliceDuration = (long) ((double) ((timeTo - timeFrom) / slices));
        List<Long> timestamps = getTimestamps(timeFrom, slices, sliceDuration);
        HashMap<String, HashMap<String, Double[]>> pairs = new HashMap<>();
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
        //d46cd6bdf67349f9b6d8eb35b794cfba
        for (OpenStackUser user : tenantList) {
            try {
                UdrMeasurement udrMeasurement = getUdrMeasurement(user.getUserId(), timeFrom, timeTo);
                //Iterate trhough all the pages
                if (udrMeasurement.getPageNumber() != null)
                    for (int page = udrMeasurement.getPageNumber(); page < ((float) udrMeasurement.getTotalRecords() / (float) udrMeasurement.getPageSize()); page++) {
                        if (page > 0) {
                            udrMeasurement = getUdrMeasurementForPage(page, user.getUserId(), timeFrom, timeTo);
                        }
                        //Iterate through every UDR
                        for (UDR udr : udrMeasurement.getData()) {
                            //Iterate through every Usage Data inside the UDR and add the usage to it's place in the slices
                            for (GenericUsageData data : udr.getData()) {
                                String resource = (String) data.getMetadata().get(data.getSourceField());
                                addUsageToSlicesDataHistogram(sliceMap, data, resource, udr.getTime(), timestamps, timeFrom, sliceDuration, data.get_class());
                                fillUsageData(data, measurementUnits, timestamps, pairs, sliceMap.get(udr.get_class()), slicePairs, measurementCharts, graphSelectionValues, totalUsage, data.getSourceField(), tenantId);
                            }
                        }
                    }
            } catch (Exception e) {
                System.out.print("Error while getting data from the tenant: " + e.getMessage());
            }
        }
        addUsageModel(model, measurementCharts, measurementUnits, pairs, sliceMap, slicePairs, timestamps, timeFrom, username, password, measurements, graphSelectionValues, tenantNameList, totalUsage);
        if (isAdmin)
            return "switch_udr_chartjs";
        else
            return "switch_user_udr_chartjs";
    }

    private List<Long> getTimestamps(Long timeFrom, int slices, long sliceDuration) {
        ArrayList timestamps = new ArrayList();
        for (int i = 0; i < slices; i++) {
            timestamps.add(timeFrom + i * sliceDuration);
        }
        return timestamps;
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
    public String generateCharge(@ModelAttribute("username") String username, @ModelAttribute("password") String password, @RequestParam(value = "from", required = false) String from, @RequestParam(value = "to", required = false) String to, Model model) {
        boolean isAdmin = isOpenStackAdmin(username, password);
        Long timeFrom = initialiseFrom(from);
        Long timeTo = initialiseTo(to);
        int slices = Loader.getSettings().getRepresentationSettings().getTimeSlices();
        long sliceDuration = (long) ((double) ((timeTo - timeFrom) / slices));
        List<Long> timestamps = getTimestamps(timeFrom, slices, sliceDuration);
        HashMap<String, HashMap<String, Double[]>> pairs = new HashMap<>();
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
        //d46cd6bdf67349f9b6d8eb35b794cfba
        for (OpenStackUser user : tenantList) {
            try {
                CdrMeasurement cdrMeasurement = getCdrMeasurement(user.getUserId(), timeFrom, timeTo);
                //Iterate trough all the pages
                if (cdrMeasurement.getPageNumber() != null)
                    for (int page = cdrMeasurement.getPageNumber(); page < ((float) cdrMeasurement.getTotalRecords() / (float) cdrMeasurement.getPageSize()); page++) {
                        if (page > 0) {
                            cdrMeasurement = getCdrMeasurementForPage(page, user.getUserId(), timeFrom, timeTo);
                        }
                        //Iterate through every CDR
                        for (CDR cdr : cdrMeasurement.getData()) {
                            //Iterate through every Charge Data inside the CDR
                            for (GenericChargeData data : cdr.getData()) {
                                String resource = (String) data.getMetadata().get(data.getSourceField());
                                addChargeToSlicesDataHistogram(sliceMap, data, resource, cdr.getTime(), timestamps, timeFrom, sliceDuration, data.get_class());
                                fillChargeData(data, timestamps, pairs, sliceMap.get(cdr.get_class()), slicePairs, measurementCharts, graphSelectionValues, totalCharge, data.getSourceField(), tenantId);
                            }
                        }
                    }
            } catch (Exception e) {
                System.out.print("Error: " + e.getMessage());
            }
        }
        addChargeModel(model, measurementCharts, measurementCharges, pairs, sliceMap, slicePairs, timestamps, username, password, measurements, graphSelectionValues, tenantNameList, totalCharge);

        if (isAdmin)
            return "switch_cdr_chartjs";
        else
            return "switch_users_cdr_chartjs";
    }

    private void fillChargeData(GenericChargeData data, List<Long> timestamps, HashMap<String, HashMap<String, Double[]>> pairs, HashMap<String, Double[]> slicesData, HashMap<String, HashMap<String, Object>> slicePairs, HashMap<String, String> measurementCharts, ArrayList<String> graphSelectionValues, HashMap<String, Double> totalCharge, String nameField, String tenantId) {
        String pieRepresentation = "number";
        Double[] values;
        HashMap<String, Double[]> metaHash = pairs.get(data.get_class());
        HashMap<String, Object> sliceMetaHash = slicePairs.get(data.get_class());
        if (metaHash == null)
            metaHash = new HashMap<>();
        if (sliceMetaHash == null)
            sliceMetaHash = new HashMap<>();
        Map metadata = data.getMetadata();
        //Using pie representation for all of them in the overview page
        //If the data is identified by metadata we can know who is the consumer
        if (metadata != null)
            values = metaHash.get(metadata.get(data.getSourceField()));
        else
            values = metaHash.get(tenantId);
        if (values == null) {
            values = new Double[1];
            values[0] = 0.0;
        }
        Double charge = data.getCharge();
        values[0] = values[0] + charge;

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

    private void fillUsageData(GenericUsageData data, HashMap<String, String> measurementUnits, List<Long> timestamps, HashMap<String, HashMap<String, Double[]>> pairs, HashMap<String, Double[]> slicesData, HashMap<String, HashMap<String, Object>> slicePairs, HashMap<String, String> measurementCharts, ArrayList<String> graphSelectionValues, HashMap<String, Double> totalUsage, String nameField, String tenantId) {
        String pieRepresentation = "number";
        Double[] values;
        HashMap<String, Double[]> metaHash = pairs.get(data.get_class());
        HashMap<String, Object> sliceMetaHash = slicePairs.get(data.get_class());
        if (metaHash == null)
            metaHash = new HashMap<>();
        if (sliceMetaHash == null)
            sliceMetaHash = new HashMap<>();
        Map metadata = data.getMetadata();
        //Using pie representation for all of them in the overview page
        //If the data is identified by metadata we can know who is the consumer
        if (metadata != null)
            values = metaHash.get(metadata.get(data.getSourceField()));
        else
            values = metaHash.get(tenantId);
        if (values == null) {
            values = new Double[1];
            values[0] = 0.0;
        }
        Double usage = data.getUsage();
        values[0] = values[0] + usage;

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

        OSFactory.enableLegacyEndpointHandling(true);
        try {
            os = OSFactory.builder()
                    .endpoint(keystoneUrl)
                    .credentials(username, password)
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

    private boolean isOpenStackAdmin(String username, String password) {
        String keystoneUrl = Loader.getSettings().getOpenStackCredentials().getKeystoneUrl();

        OSFactory.enableLegacyEndpointHandling(true);
        try {
            OSFactory.builder()
                    .endpoint(keystoneUrl)
                    .credentials(username, password)
                    .perspective(Facing.ADMIN)
                    .authenticate();
            return true;
        } catch (Exception e) {
            return false;
        }
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

    private UdrMeasurement getUdrMeasurementForPage(int page, String tenant, Long timeFrom, Long timeTo) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getUdrDataUrl();
        String udrMeasurementUrl = this.constructDataUrl(url, tenant, timeFrom, timeTo);
        APICaller.Response response = new APICaller().get(new URL(constructMeasurementUrlForPage(udrMeasurementUrl, page)));
        return (UdrMeasurement) response.getAsClass(UdrMeasurement.class);
    }

    private CdrMeasurement getCdrMeasurementForPage(int page, String tenant, Long timeFrom, Long timeTo) throws Exception {
        String url = Loader.getSettings().getCyclopsSettings().getCdrDataUrl();
        String cdrMeasurementUrl = this.constructDataUrl(url, tenant, timeFrom, timeTo);
        APICaller.Response response = new APICaller().get(new URL(constructMeasurementUrlForPage(cdrMeasurementUrl, page)));
        return (CdrMeasurement) response.getAsClass(CdrMeasurement.class);
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

    /**
     * This method checks if the username and password values are empty.
     *
     * @param username
     * @param password
     * @return
     */
    private boolean isAuthenticated(String username, String password) {
        return !(username.equals("") || password.equals(""));
    }

    private void addUsageModel(Model model, HashMap<String, String> measurementCharts, HashMap<String, String> measurementUnits, HashMap<String, HashMap<String, Double[]>> pairs, HashMap<String, HashMap<String, Double[]>> sliceMap, HashMap<String, HashMap<String, Object>> slicePairs, List<Long> timestamps, Long timeFrom, String username, String password, List<String> measurements, ArrayList<String> graphSelectionValues, List<String> tenantNameList, HashMap<String, Double> totalUsage) {
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

    private void addChargeModel(Model model, HashMap<String, String> measurementCharts, HashMap<String, Double> measurementCharges, HashMap<String, HashMap<String, Double[]>> pairs, HashMap<String, HashMap<String, Double[]>> sliceMap, HashMap<String, HashMap<String, Object>> slicePairs, List<Long> timestamps, String username, String password, List<String> measurements, ArrayList<String> graphSelectionValues, List<String> tenantNameList, HashMap<String, Double> totalCharge) {
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
