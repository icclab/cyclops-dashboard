package ch.cyclops.model.Cyclops;

import java.util.ArrayList;
import java.util.Date;
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

public class ScaleUpBill {
    private String _class;
    private String account;
    private Long from;
    private Long to;
    private Double amount;
    private List projects;
    private List<String> projectNames;
    private String utcFrom;
    private String utcTo;

    public ScaleUpBill() {
    }

    public String getUtcFrom() {
        return utcFrom;
    }

    public void setUtcFrom(Long utcFrom) {
        this.utcFrom = new Date(utcFrom * 1000).toString();
    }

    public String getUtcTo() {
        return utcTo;
    }

    public void setUtcTo(Long utcTo) {
        this.utcTo = new Date(utcTo * 1000).toString();
    }

    public List<String> getProjectNames() {
        return projectNames;
    }

    public void setProjectNames(List<String> projectNames) {
        this.projectNames = projectNames;
    }

    public String get_class() {
        return _class;
    }

    public void set_class(String _class) {
        this._class = _class;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public Long getFrom() {
        return from;
    }

    public void setFrom(Long from) {
        this.from = from;
    }

    public Long getTo() {
        return to;
    }

    public void setTo(Long to) {
        this.to = to;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public List getProjects() {
        return projects;
    }

    public void setProjects(List projects) {
        this.projects = projects;
    }

    public void addProjectName(String name) {
        if(this.projectNames == null){
            this.projectNames = new ArrayList<>();
        }
        this.projectNames.add(name);
    }
}
