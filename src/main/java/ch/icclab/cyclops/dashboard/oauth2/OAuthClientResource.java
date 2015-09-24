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

import org.restlet.data.ChallengeResponse;
import org.restlet.data.ChallengeScheme;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;

public class OAuthClientResource extends ClientResource {
    private String oauthToken;

    public OAuthClientResource(String url, String oauthToken) {
        super(url);
        this.oauthToken = oauthToken;
    }

    private void addTokenHeader() {
        ChallengeResponse challenge = new ChallengeResponse(ChallengeScheme.HTTP_OAUTH_BEARER);
        challenge.setRawValue(oauthToken);
        setChallengeResponse(challenge);
    }

    @Override
    public Representation get() {
        addTokenHeader();
        return super.get();
    }

    @Override
    public Representation post(Representation rep) {
        addTokenHeader();
        return super.post(rep);
    }
}