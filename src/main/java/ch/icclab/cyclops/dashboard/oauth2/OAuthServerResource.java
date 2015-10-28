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
package ch.icclab.cyclops.dashboard.oauth2;

import org.restlet.data.Header;
import org.restlet.resource.ServerResource;
import org.restlet.util.Series;

public class OAuthServerResource extends ServerResource {
    public String getOAuthTokenFromHeader() {
        Series<Header> headers = (Series<Header>) getRequestAttributes().get("org.restlet.http.headers");

        if(headers == null) {
            return "";
        }
        return headers.getFirstValue("X-OAuth-Token", true, "");
    }
}