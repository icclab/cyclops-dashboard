#!/bin/bash
# Copyright (c) 2015. Zuercher Hochschule fuer Angewandte Wissenschaften
# All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# Author: Martin Skoviera

echo "Installing sqlite3"
sudo apt-get install sqlite3

echo "Configuring logging folder structure"
touch /var/log/cyclops/dashboard.log
sudo chmod 777 /var/log/cyclops/dashboard.log

echo "Creating necessary directories"
sudo mkdir ~/bills/
sudo chmod 777 ~/bills/
sudo mkdir ~/sqlite/
sudo chmod 777 ~/sqlite/

echo "Setting up database tables"
sqlite3 ~/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS meter_source (ID INTEGER PRIMARY KEY, source        TEXT    NOT NULL);";
sqlite3 ~/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS bills (ID INTEGER PRIMARY KEY, userId        TEXT    NOT NULL, billPDF       TEXT    NOT NULL, fromDate      TEXT    NOT NULL, toDate        TEXT    NOT NULL, approved      BOOLEAN NOT NULL DEFAULT 0, paid          BOOLEAN NOT NULL DEFAULT 0, dueDate       TEXT    NOT NULL, paymentDate   TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
sqlite3 ~/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS external_id (ID INTEGER PRIMARY KEY, userId        TEXT    NOT NULL, meterSourceId INTEGER NOT NULL, meterUserId   TEXT    NOT NULL);";
sqlite3 ~/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS gatekeeper_users (username      TEXT        PRIMARY KEY, password      TEXT        NOT NULL, userId        TEXT        NOT NULL);";
sqlite3 ~/sqlite/dashboard.db "CREATE TABLE  IF NOT EXISTS dashboard_users (username          TEXT        PRIMARY KEY, password           TEXT        NOT NULL, name               TEXT        NOT NULL, surname            TEXT        NOT NULL, email              TEXT        NOT NULL, isAdmin            BOOLEAN     NOT NULL, keystoneId         TEXT);";
chmod 777 ~/sqlite/dashboard.db

echo "Preparing configuration file"
cd ../src/main/webapp/WEB-INF/
mv configuration_events.txt configuration.txt
vi configuration.txt

sudo -k