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

echo "Downloading GateKeeper from GitHub"
git clone https://github.com/icclab/gatekeeper.git

echo "Configuring GateKeeper"
vi gatekeeper.cfg

# if we run it later with "auth_utils"
cp gatekeeper.cfg ~/
cp gatekeeper.cfg ./gatekeeper/

cd gatekeeper
echo "Installing the GateKeeper"
sudo chmod +x install.sh
./install.sh
