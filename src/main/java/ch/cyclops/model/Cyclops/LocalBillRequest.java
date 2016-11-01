package ch.cyclops.model.Cyclops;

import java.util.List;

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
 * Created by Manu Perez on 28/10/16.
 */

public class LocalBillRequest {
    private String _class = this.getClass().getSimpleName();
    private String account;
    private List<String> linked;
    private Long from;
    private Long to;

    public LocalBillRequest(String account, List linked, Long from, Long to) {
        this.account = account;
        this.linked = linked;
        this.from = from;
        this.to = to;
    }

    public String get_class() {
        return _class;
    }

    public String getAccount() {
        return account;
    }

    public List<String> getLinked() {
        return linked;
    }

    public Long getFrom() {
        return from;
    }

    public Long getTo() {
        return to;
    }
}
