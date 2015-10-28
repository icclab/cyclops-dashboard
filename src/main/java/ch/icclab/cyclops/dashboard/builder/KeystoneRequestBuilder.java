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

package ch.icclab.cyclops.dashboard.builder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;

/**
 * This class handles the creation of keystone request data
 */
public class KeystoneRequestBuilder {

    /**
     * This method builds the correct JSON object for a keystone authentication request
     *
     * @param username  The keystone username
     * @param pwd  The keystone password
     * @param domainName  The keystone domain
     * @return  A JSON representation
     */
    public static JsonRepresentation buildKeystoneAuthRequestBody(String username, String pwd, String domainName) throws JSONException {
        JSONObject wrapper = new JSONObject();
        JSONObject domain = new JSONObject();
        domain.put("name", domainName);
        JSONArray methods = new JSONArray();
        methods.put("password");
        JSONObject user = new JSONObject();
        user.put("domain", domain);
        user.put("name", username);
        user.put("password", pwd);
        JSONObject password = new JSONObject();
        password.put("user", user);
        JSONObject identity = new JSONObject();
        identity.put("methods", methods);
        identity.put("password", password);
        JSONObject auth = new JSONObject();
        auth.put("identity", identity);
        wrapper.put("auth", auth);

        return new JsonRepresentation(wrapper);
    }
}
