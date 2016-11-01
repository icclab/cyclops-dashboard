package ch.cyclops.model.Data;

import ch.cyclops.model.Cyclops.CDR;

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
 * Created by Manu Perez on 05/08/16.
 */

public class CdrMeasurement implements IMeasurement {
    private String measurement;
    private List<CDR> data;
    private Integer displayedRecords;
    private Integer totalRecords;
    private Integer pageNumber;
    private Integer pageSize;

    public String getMeasurement() {
        return measurement;
    }

    public void setMeasurement(String measurement) {
        this.measurement = measurement;
    }

    public List<CDR> getData() {
        return data;
    }

    public void setData(List<CDR> data) {
        this.data = data;
    }

    public Integer getDisplayedRecords() {
        return displayedRecords;
    }

    public void setDisplayedRecords(Integer displayedRecords) {
        this.displayedRecords = displayedRecords;
    }

    public Integer getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Integer totalRecords) {
        this.totalRecords = totalRecords;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }
}
