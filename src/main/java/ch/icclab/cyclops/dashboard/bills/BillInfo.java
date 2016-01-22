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
package ch.icclab.cyclops.dashboard.bills;

/**
 * @author Manu
 *         Created on 25.11.15.
 */
public class BillInfo {

    private String fromDate;
    private String toDate;
    private String dueDate;
    private boolean approved;
    private boolean paid;

    public BillInfo() {
    }

    public BillInfo(String fromDate, String toDate, String dueDate, boolean approved, boolean paid) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.dueDate = dueDate;
        this.approved = approved;
        this.paid = paid;
    }

    public void setToDate(String toDate) {
        this.toDate = toDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public String getFromDate() {
        return fromDate;
    }

    public void setFromDate(String fromDate) {
        this.fromDate = fromDate;
    }

    public String getToDate() {
        return toDate;
    }

    public String getDueDate() {
        return dueDate;
    }

    public boolean getApproved() {
        return approved;
    }

    public boolean getPaid() {
        return paid;
    }
}
