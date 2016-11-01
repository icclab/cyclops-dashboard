package ch.cyclops.model.Cyclops;

import java.util.ArrayList;
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
 * Created by Manu Perez on 29/07/16.
 */

public class ScaleUpBillRequest {
    private String _class = this.getClass().getSimpleName();
    private String subject;
    private List<String> projects;
    private Long from;
    private Long to;

    public ScaleUpBillRequest(String account, Long from, Long to) {
        this.subject = account;
        this.projects = new ArrayList<>();
        this.from = from;
        this.to = to;
    }

    public void addProject(String project){
        this.projects.add(project);
    }

    public String getSubject() {
        return subject;
    }

    public List<String> getProjects() {
        return projects;
    }

    public Long getFrom() {
        return from;
    }

    public Long getTo() {
        return to;
    }

}
